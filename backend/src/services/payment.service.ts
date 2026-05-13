import { createAdminClient } from '@/lib/supabase'
import { CryptoService } from './crypto.service'
import { NotificationService } from './notification.service'
import { ActivityLogService } from './activity-log.service'
import { templates } from '@/templates/messages'

/**
 * Pasca-migrasi dari Duitku ke manual QRIS flow (GoPay Saya), service ini
 * cuma menjadi container untuk helper-helper notif post-payment yang
 * dipakai bareng oleh ManualPaymentService dan AdminOrdersService:
 *
 *   - notifyBuyerPaymentReceived(order) — dipanggil setelah admin verify
 *   - alertAdminPendingFulfillment(order) — dipanggil setelah verify, kasih
 *     reminder admin untuk fulfill manual
 *   - notifyBuyerDelivered(order) — dipanggil setelah admin fulfill
 *   - creditReferralAndNotify(orderId, refereeId) — trigger RPC credit
 *     referral + kirim notif ke referrer kalau eligible
 *
 * Tidak ada lagi createTransactionForOrder / processCallback — Duitku
 * integration sudah dihapus.
 */

type OrderForPayment = {
  id: string
  user_id: string
  product_id: string
  order_number: string
  total_idr: number
  status: string
}

export class PaymentService {
  static async notifyBuyerPaymentReceived(order: OrderForPayment): Promise<void> {
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

    // Alert admin untuk fulfill manual
    await this.alertAdminPendingFulfillment(order)
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
