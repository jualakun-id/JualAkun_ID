import { createAdminClient } from '@/lib/supabase'
import { createSnapTransaction, verifyMidtransSignature } from '@/lib/midtrans'
import { ApiError } from '@/types/errors'
import { DeliveryService } from './delivery.service'
import { CryptoService } from './crypto.service'
import { NotificationService } from './notification.service'
import { templates } from '@/templates/messages'

type SnapResult = {
  snap_token: string
  snap_url: string
}

type MidtransNotification = {
  order_id: string
  transaction_id: string
  transaction_status: string
  fraud_status?: string
  status_code: string
  gross_amount: string
  payment_type?: string
  signature_key: string
  settlement_time?: string
}

type WebhookOutcome =
  | { ok: true; effect: 'paid' | 'expired' | 'cancelled' | 'refunded' | 'pending' | 'noop' }
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
   * Create a Midtrans Snap token for an order in pending_payment state.
   * Persists snap_token + snap_url + payment_external_id back to the order row.
   */
  static async createSnapForOrder(orderId: string): Promise<SnapResult> {
    const supabase = createAdminClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `id, user_id, order_number, total_idr, status,
         products!inner ( name ),
         profiles!orders_user_id_fkey ( full_name, phone_wa )`,
      )
      .eq('id', orderId)
      .maybeSingle()

    if (error || !order) {
      throw new ApiError('NOT_FOUND', 'Order tidak ditemukan', 404)
    }
    if (order.status !== 'pending_payment') {
      throw new ApiError('PAYMENT_INVALID', 'Order tidak dalam status menunggu pembayaran', 400)
    }

    // Supabase joined relations come back as arrays in TS — unwrap.
    const productRel = (order as unknown as { products: { name: string } | { name: string }[] }).products
    const product = Array.isArray(productRel) ? productRel[0] : productRel
    const profileRel = (order as unknown as {
      profiles: { full_name?: string; phone_wa?: string } | { full_name?: string; phone_wa?: string }[] | null
    }).profiles
    const profile = Array.isArray(profileRel) ? profileRel[0] : profileRel

    const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id)

    const snap = await createSnapTransaction({
      transaction_details: {
        order_id: order.order_number,
        gross_amount: order.total_idr,
      },
      customer_details: {
        first_name: profile?.full_name ?? 'JualAkun Buyer',
        email: authUser.user?.email ?? undefined,
        phone: profile?.phone_wa ?? undefined,
      },
      item_details: [
        {
          id: order.id,
          price: order.total_idr,
          quantity: 1,
          name: product.name.slice(0, 50),
        },
      ],
    })

    await supabase
      .from('orders')
      .update({
        payment_snap_token: snap.token,
        payment_snap_url: snap.redirect_url,
        payment_external_id: order.order_number,
      })
      .eq('id', orderId)

    return { snap_token: snap.token, snap_url: snap.redirect_url }
  }

  /**
   * Process a Midtrans webhook notification.
   * Returns an outcome — caller (route) always responds 200 to Midtrans.
   *
   * Flow:
   *  1. Verify SHA-512 signature
   *  2. Map transaction_status → order status
   *  3. On 'paid': update order, call deliver_order_account RPC, notify buyer
   *  4. On terminal failure: mark expired/cancelled, alert admin if needed
   */
  static async processWebhook(notif: MidtransNotification): Promise<WebhookOutcome> {
    const valid = await verifyMidtransSignature(
      notif.order_id,
      notif.status_code,
      notif.gross_amount,
      notif.signature_key,
    )
    if (!valid) {
      console.warn('[midtrans] invalid signature', { order_id: notif.order_id })
      return { ok: false, reason: 'INVALID_SIGNATURE' }
    }

    const supabase = createAdminClient()

    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id, product_id, total_idr, status, order_number, payment_status')
      .eq('order_number', notif.order_id)
      .maybeSingle<OrderForPayment & { payment_status: string }>()

    if (!order) {
      console.warn('[midtrans] order not found', { order_id: notif.order_id })
      return { ok: false, reason: 'ORDER_NOT_FOUND' }
    }

    // Idempotency: ignore if already settled into a terminal paid-state.
    if (TERMINAL_PAID_STATUSES.has(order.status)) {
      return { ok: true, effect: 'noop' }
    }

    const effect = mapMidtransStatus(notif)

    // Always log the latest payment metadata regardless of effect.
    await supabase
      .from('orders')
      .update({
        payment_transaction_id: notif.transaction_id,
        payment_method: notif.payment_type ?? null,
        payment_status: notif.transaction_status,
        payment_metadata: notif as unknown as Record<string, unknown>,
      })
      .eq('id', order.id)

    if (effect === 'paid') {
      await this.handlePaid(order)
      return { ok: true, effect: 'paid' }
    }

    if (effect === 'expired' || effect === 'cancelled') {
      await supabase
        .from('orders')
        .update({ status: 'expired' })
        .eq('id', order.id)
        .eq('status', 'pending_payment')
      return { ok: true, effect }
    }

    if (effect === 'refunded') {
      await supabase.from('orders').update({ status: 'refunded' }).eq('id', order.id)
      return { ok: true, effect }
    }

    return { ok: true, effect: 'pending' }
  }

  private static async handlePaid(order: OrderForPayment): Promise<void> {
    const supabase = createAdminClient()

    // Mark order as paid (only if still pending_payment) — drives the RPC guard.
    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('status', 'pending_payment')
      .select('id')
      .maybeSingle()

    if (updateErr || !updated) {
      console.warn('[midtrans] paid update skipped (already advanced?)', { order_id: order.id })
      return
    }

    try {
      await DeliveryService.deliverOrder(order.id)
      await this.notifyBuyerDelivered(order)
    } catch (err) {
      console.error('[midtrans] delivery failed', { order_id: order.id, err })
      await this.alertAdminDeliveryFailed(order)
    }
  }

  private static async notifyBuyerDelivered(order: OrderForPayment): Promise<void> {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('orders')
      .select(
        `guarantee_expires_at,
         account_stock(credentials_enc, note),
         profiles!orders_user_id_fkey(full_name, phone_wa),
         products!inner(name)`,
      )
      .eq('id', order.id)
      .maybeSingle()

    const stock = (data as { account_stock?: { credentials_enc: string; note?: string } | { credentials_enc: string; note?: string }[] } | null)?.account_stock
    const stockObj = Array.isArray(stock) ? stock[0] : stock
    const credentialsEnc = stockObj?.credentials_enc
    if (!credentialsEnc) return

    const profileRel = (data as { profiles?: { full_name?: string; phone_wa?: string } | { full_name?: string; phone_wa?: string }[] } | null)?.profiles
    const profile = Array.isArray(profileRel) ? profileRel[0] : profileRel
    const productRel = (data as { products: { name: string } | { name: string }[] }).products
    const product = Array.isArray(productRel) ? productRel[0] : productRel
    const guaranteeExpiresAt = (data as { guarantee_expires_at: string }).guarantee_expires_at

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
  }

  private static async alertAdminDeliveryFailed(order: OrderForPayment): Promise<void> {
    const adminWa = process.env.ADMIN_WHATSAPP_NUMBER
    if (!adminWa) return
    const tpl = templates.adminDeliveryFailed({ orderNumber: order.order_number })
    await NotificationService.sendWhatsApp({
      target: adminWa,
      message: tpl.waText,
      template: tpl.template,
      orderId: order.id,
    })
  }
}

function mapMidtransStatus(
  n: Pick<MidtransNotification, 'transaction_status' | 'fraud_status'>,
): 'paid' | 'pending' | 'expired' | 'cancelled' | 'refunded' | 'noop' {
  switch (n.transaction_status) {
    case 'settlement':
      return 'paid'
    case 'capture':
      return n.fraud_status === 'accept' ? 'paid' : 'pending'
    case 'pending':
      return 'pending'
    case 'expire':
      return 'expired'
    case 'cancel':
    case 'deny':
      return 'cancelled'
    case 'refund':
    case 'partial_refund':
      return 'refunded'
    default:
      return 'noop'
  }
}
