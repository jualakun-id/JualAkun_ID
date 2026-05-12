import { createAdminClient } from '@/lib/supabase'
import { createInquiry, verifyCallbackSignature } from '@/lib/duitku'
import { ApiError } from '@/types/errors'
import { CryptoService } from './crypto.service'
import { NotificationService } from './notification.service'
import { ActivityLogService } from './activity-log.service'
import { templates } from '@/templates/messages'

type CreateTransactionResult = {
  reference: string
  payment_url: string
  va_number: string | null
  qr_string: string | null
}

/**
 * Subset of Duitku callback fields we act on.
 * Full list: https://docs.duitku.com/api/id (Callback API)
 */
export type DuitkuCallback = {
  merchantCode: string
  amount: string
  merchantOrderId: string
  signature: string
  reference: string
  resultCode: string // '00' success, '01' failed
  paymentCode?: string
  productDetail?: string
  additionalParam?: string
  merchantUserId?: string
  publisherOrderId?: string
  spUserHash?: string
  settlementDate?: string
  issuerCode?: string
}

type WebhookOutcome =
  | { ok: true; effect: 'paid' | 'failed' | 'noop' }
  | { ok: false; reason: string }

type OrderForPayment = {
  id: string
  user_id: string
  product_id: string
  order_number: string
  total_idr: number
  status: string
}

const TERMINAL_PAID_STATUSES = new Set(['paid', 'delivering', 'delivered', 'confirmed', 'refunded'])

export class PaymentService {
  /**
   * Create a Duitku transaction for an order in pending_payment state.
   * Persists reference + paymentUrl back to the order row so the buyer can
   * resume payment from their order detail page.
   */
  static async createTransactionForOrder(orderId: string): Promise<CreateTransactionResult> {
    const supabase = createAdminClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `id, user_id, order_number, total_idr, status,
         products!inner ( name )`,
      )
      .eq('id', orderId)
      .maybeSingle()

    if (error || !order) {
      throw new ApiError('NOT_FOUND', 'Order tidak ditemukan', 404)
    }
    if (order.status !== 'pending_payment') {
      throw new ApiError('PAYMENT_INVALID', 'Order tidak dalam status menunggu pembayaran', 400)
    }

    // orders.user_id REFERENCES auth.users (bukan profiles), jadi gak bisa
    // langsung embed profiles via FK. Pakai separate query.
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_wa')
      .eq('id', (order as { user_id: string }).user_id)
      .maybeSingle()

    // Supabase joined relations come back as arrays in TS — unwrap.
    const productRel = (order as unknown as { products: { name: string } | { name: string }[] }).products
    const product = Array.isArray(productRel) ? productRel[0] : productRel

    const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id)
    const email = authUser.user?.email ?? `${order.order_number.toLowerCase()}@no-reply.jualakun.id`
    const fullName = profile?.full_name ?? 'Jualakun.id Buyer'
    const [firstName, ...lastParts] = fullName.split(' ')

    const apiBase = process.env.PUBLIC_API_URL ?? ''
    const siteBase = process.env.PUBLIC_SITE_URL ?? ''
    if (!apiBase || !siteBase) {
      throw new ApiError('INTERNAL_ERROR', 'PUBLIC_API_URL / PUBLIC_SITE_URL belum di-set', 500)
    }

    const inquiry = await createInquiry({
      merchantOrderId: order.order_number,
      paymentAmount: order.total_idr,
      productDetails: product.name.slice(0, 80),
      email,
      customerVaName: fullName.slice(0, 50),
      phoneNumber: profile?.phone_wa,
      callbackUrl: `${apiBase}/payment/callback`,
      returnUrl: `${siteBase}/checkout/selesai?order_id=${order.id}`,
      itemDetails: [
        {
          name: product.name.slice(0, 50),
          price: order.total_idr,
          quantity: 1,
        },
      ],
      customerDetail: {
        firstName: firstName || 'Buyer',
        lastName: lastParts.join(' ') || undefined,
        email,
        phoneNumber: profile?.phone_wa,
      },
    })

    await supabase
      .from('orders')
      .update({
        payment_reference: inquiry.reference,
        payment_url: inquiry.paymentUrl,
        payment_external_id: order.order_number,
      })
      .eq('id', orderId)

    return {
      reference: inquiry.reference,
      payment_url: inquiry.paymentUrl,
      va_number: inquiry.vaNumber ?? null,
      qr_string: inquiry.qrString ?? null,
    }
  }

  /**
   * Process a Duitku callback notification.
   * Returns an outcome — caller (route) always responds 200 to Duitku to
   * suppress retries; we self-recover via cron + admin alerts.
   *
   * Flow:
   *  1. Verify MD5 signature (formula in lib/duitku.ts)
   *  2. Map resultCode → order status
   *  3. On '00': mark paid, call deliver_order_account RPC, notify buyer
   *  4. On '01': mark expired (final state per Duitku — they don't retry)
   */
  static async processCallback(notif: DuitkuCallback): Promise<WebhookOutcome> {
    const valid = await verifyCallbackSignature({
      merchantCode: notif.merchantCode,
      amount: notif.amount,
      merchantOrderId: notif.merchantOrderId,
      signature: notif.signature,
    })
    if (!valid) {
      console.warn('[duitku] invalid signature', { merchantOrderId: notif.merchantOrderId })
      return { ok: false, reason: 'INVALID_SIGNATURE' }
    }

    const supabase = createAdminClient()

    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id, product_id, total_idr, status, order_number')
      .eq('order_number', notif.merchantOrderId)
      .maybeSingle<OrderForPayment>()

    if (!order) {
      console.warn('[duitku] order not found', { merchantOrderId: notif.merchantOrderId })
      return { ok: false, reason: 'ORDER_NOT_FOUND' }
    }

    // Idempotency: ignore if already settled into a terminal paid-state.
    if (TERMINAL_PAID_STATUSES.has(order.status)) {
      return { ok: true, effect: 'noop' }
    }

    // Defense in depth: amount tamper check. Duitku already signs amount but we
    // double-check it matches the order we're acting on.
    const amountNum = Number(notif.amount)
    if (Number.isFinite(amountNum) && amountNum !== order.total_idr) {
      console.warn('[duitku] amount mismatch', {
        order_id: order.id,
        notif: amountNum,
        order: order.total_idr,
      })
      return { ok: false, reason: 'AMOUNT_MISMATCH' }
    }

    // Always log the latest payment metadata regardless of effect.
    await supabase
      .from('orders')
      .update({
        payment_transaction_id: notif.reference,
        payment_method: notif.paymentCode ?? null,
        payment_status: notif.resultCode,
        payment_metadata: notif as unknown as Record<string, unknown>,
      })
      .eq('id', order.id)

    if (notif.resultCode === '00') {
      await this.handlePaid(order)
      return { ok: true, effect: 'paid' }
    }

    if (notif.resultCode === '01') {
      await supabase
        .from('orders')
        .update({ status: 'expired' })
        .eq('id', order.id)
        .eq('status', 'pending_payment')
      return { ok: true, effect: 'failed' }
    }

    return { ok: true, effect: 'noop' }
  }

  private static async handlePaid(order: OrderForPayment): Promise<void> {
    const supabase = createAdminClient()

    // Mark order as paid (only if still pending_payment).
    // Atomic update + .eq('status', 'pending_payment') = idempotency guard:
    // kalau Duitku retry callback (mereka kadang lakukan), update kedua tidak
    // match karena status sudah 'paid'. Updated null → exit early sebelum
    // emit activity log / notif (mencegah duplicate event).
    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('status', 'pending_payment')
      .select('id')
      .maybeSingle()

    if (updateErr || !updated) {
      console.info('[duitku] callback idempotent — order sudah paid sebelumnya', { order_id: order.id })
      return
    }

    // Manual fulfillment model (Opsi A): tidak auto-deliver.
    // Order tetap di status 'paid' sampai admin fulfill manual via admin panel.
    // Kirim notif "pembayaran berhasil, sedang diproses" ke buyer + alert admin.
    try {
      await this.notifyBuyerPaymentReceived(order)
      await this.alertAdminPendingFulfillment(order)
    } catch (err) {
      console.error('[duitku] post-paid notif failed', { order_id: order.id, err })
    }

    // Log activity feed untuk admin
    await ActivityLogService.log({
      event_type: 'order_paid',
      ref_id: order.id,
      ref_table: 'orders',
      title: `Pembayaran diterima: ${order.order_number}`,
      description: `Total Rp ${order.total_idr.toLocaleString('id-ID')} — perlu di-fulfill`,
      metadata: {
        order_number: order.order_number,
        total_idr: order.total_idr,
        user_id: order.user_id,
        product_id: order.product_id,
      },
    })
  }

  private static async notifyBuyerPaymentReceived(order: OrderForPayment): Promise<void> {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('orders')
      .select(`products!inner(name)`)
      .eq('id', order.id)
      .maybeSingle()
    const productRel = (data as { products: { name: string } | { name: string }[] } | null)?.products
    const product = Array.isArray(productRel) ? productRel[0] : productRel

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_wa')
      .eq('id', order.user_id)
      .maybeSingle()

    const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id)
    const email = authUser.user?.email

    const tpl = templates.paymentReceived({
      fullName: profile?.full_name ?? 'Buyer',
      orderNumber: order.order_number,
      productName: product?.name ?? 'Akun Digital',
      totalIdr: order.total_idr,
    })

    if (profile?.phone_wa) {
      await NotificationService.sendWhatsApp({
        target: profile.phone_wa,
        message: tpl.waText,
        template: tpl.template,
        userId: order.user_id,
        orderId: order.id,
      })
    }
    if (email) {
      await NotificationService.sendEmail({
        to: email,
        subject: tpl.emailSubject,
        html: tpl.emailHtml,
        template: tpl.template,
        userId: order.user_id,
        orderId: order.id,
      })
    }
  }

  private static async alertAdminPendingFulfillment(order: OrderForPayment): Promise<void> {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('orders')
      .select('products!inner(name)')
      .eq('id', order.id)
      .maybeSingle()
    const productRel = (data as { products: { name: string } | { name: string }[] } | null)?.products
    const product = Array.isArray(productRel) ? productRel[0] : productRel
    const tpl = templates.adminPendingFulfillment({
      orderNumber: order.order_number,
      productName: product?.name ?? 'Akun Digital',
    })
    await NotificationService.sendAdminAlert({
      template: tpl.template,
      title: 'Order Perlu Fulfillment',
      message: tpl.waText.replace(/^\[[^\]]+\]\n\n/, ''),
    })
  }

  static async notifyBuyerDelivered(order: OrderForPayment): Promise<void> {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('orders')
      .select(
        `guarantee_expires_at,
         account_stock(credentials_enc, note),
         products!inner(name)`,
      )
      .eq('id', order.id)
      .maybeSingle()

    const stock = (data as { account_stock?: { credentials_enc: string; note?: string } | { credentials_enc: string; note?: string }[] } | null)?.account_stock
    const stockObj = Array.isArray(stock) ? stock[0] : stock
    const credentialsEnc = stockObj?.credentials_enc
    if (!credentialsEnc) return

    const productRel = (data as { products: { name: string } | { name: string }[] } | null)?.products
    const product = Array.isArray(productRel) ? productRel[0] : productRel
    const guaranteeExpiresAt = (data as { guarantee_expires_at: string } | null)?.guarantee_expires_at ?? ''

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_wa')
      .eq('id', order.user_id)
      .maybeSingle()

    const credsPlain = await CryptoService.decrypt(credentialsEnc)
    const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id)
    const email = authUser.user?.email

    const tpl = templates.accountDelivered({
      fullName: profile?.full_name ?? 'Buyer',
      orderNumber: order.order_number,
      productName: product?.name ?? 'Akun Digital',
      credentials: credsPlain,
      note: stockObj?.note ?? null,
      guaranteeExpiresAt,
    })

    if (profile?.phone_wa) {
      await NotificationService.sendWhatsApp({
        target: profile.phone_wa,
        message: tpl.waText,
        template: tpl.template,
        userId: order.user_id,
        orderId: order.id,
      })
    }

    if (email) {
      await NotificationService.sendEmail({
        to: email,
        subject: tpl.emailSubject,
        html: tpl.emailHtml,
        template: tpl.template,
        userId: order.user_id,
        orderId: order.id,
      })
    }

    // Trigger referral credit setelah delivered (kalau ini transaksi pertama
    // referred user, referrer dapat kredit + notif). RPC handle eligibility:
    //   - order status harus 'delivered' (sudah ✅ kalau sampai sini)
    //   - referee belum pernah ada delivered order sebelumnya
    //   - ada referrals row status 'pending' untuk referee
    try {
      await PaymentService.creditReferralAndNotify(order.id, order.user_id)
    } catch (err) {
      console.warn('[notify-delivered] credit_referral failed (non-blocking):', err)
    }
  }

  /**
   * Trigger RPC credit_referral untuk eligibility check + grant kredit ke
   * referrer. Kalau berhasil, kirim notif WA+email ke referrer.
   *
   * RPC return shape:
   *   { ok: true, referrer_id, credit_amount } — kalau eligible
   *   { ok: false, code: 'NOT_FIRST_ORDER' | 'NO_REFERRAL' | ... } — kalau skip
   *
   * Notif dikirim ke referrer (bukan referee) — referee identity tidak di-share
   * untuk privacy.
   */
  private static async creditReferralAndNotify(orderId: string, refereeUserId: string): Promise<void> {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('credit_referral', { p_order_id: orderId })
    if (error) {
      console.warn('[credit_referral] RPC error:', error.message)
      return
    }
    const result = data as { ok: boolean; code?: string; referrer_id?: string; credit_amount?: number } | null
    if (!result?.ok || !result.referrer_id || !result.credit_amount) {
      return // not eligible (not first order / no referral / etc) — silent skip
    }

    // Activity log untuk admin dashboard
    await ActivityLogService.log({
      event_type: 'referral_credited',
      ref_id: orderId,
      ref_table: 'orders',
      title: `Kredit referral diberikan: Rp ${result.credit_amount.toLocaleString('id-ID')}`,
      description: `Referrer ${result.referrer_id.slice(0, 8)}... dapat kredit dari pesanan pertama referee`,
      metadata: {
        referrer_id: result.referrer_id,
        referee_id: refereeUserId,
        credit_amount: result.credit_amount,
        order_id: orderId,
      },
    })

    // Notif ke referrer — fetch referrer profile + credits total
    const { data: refProfile } = await supabase
      .from('profiles')
      .select('full_name, phone_wa, credits')
      .eq('id', result.referrer_id)
      .maybeSingle()
    if (!refProfile) return
    const { data: refAuth } = await supabase.auth.admin.getUserById(result.referrer_id)
    const refEmail = refAuth.user?.email

    const tpl = templates.referralCredited({
      fullName: refProfile.full_name ?? 'Member',
      creditAmount: result.credit_amount,
      totalCredits: refProfile.credits ?? result.credit_amount,
    })

    if (refProfile.phone_wa) {
      await NotificationService.sendWhatsApp({
        target: refProfile.phone_wa,
        message: tpl.waText,
        template: tpl.template,
        userId: result.referrer_id,
        orderId,
      })
    }
    if (refEmail) {
      await NotificationService.sendEmail({
        to: refEmail,
        subject: tpl.emailSubject,
        html: tpl.emailHtml,
        template: tpl.template,
        userId: result.referrer_id,
        orderId,
      })
    }
  }
}
