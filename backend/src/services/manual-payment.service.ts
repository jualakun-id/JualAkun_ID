import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'
import { injectAmount, generateUniqueSuffix } from '@/lib/qris'
import { ActivityLogService } from './activity-log.service'
import { NotificationService } from './notification.service'
import { PaymentService } from './payment.service'
import { templates } from '@/templates/messages'

type CreateManualPaymentResult = {
  order_id: string
  order_number: string
  total_idr: number             // sudah include unique suffix
  unique_suffix: number          // 3-digit suffix untuk admin identify
  qris_dynamic_payload: string   // payload string untuk render QR di frontend
  expires_at: string
}

type VerifyResult = { ok: true; order_number: string }
type RejectResult = { ok: true; order_number: string }

const SUFFIX_RETRY_LIMIT = 30

/**
 * Manual payment flow via QRIS GoPay Saya (admin verify dari mutasi app).
 *
 * Tujuan: bypass payment gateway approval (Duitku reject + OkeConnect H2H
 * butuh CS approval). Pakai QRIS Statis existing → inject unique amount →
 * admin manual confirm via /admin/pesanan.
 *
 * Flow:
 *   1. CheckoutService.createOrder() → calls setupManualPayment() di sini
 *   2. Generate unique suffix (3-digit), retry kalau collision sama total_idr
 *      pending order lain (DB unique partial index sebagai final guard)
 *   3. total_idr final = product_price + suffix (e.g. 75000 + 123 = 75123)
 *   4. Generate QRIS Dinamis payload dengan amount injected
 *   5. Persist suffix + adjusted total_idr di order
 *   6. Return data untuk frontend display
 *
 * Verify flow (admin):
 *   - Admin liat /admin/pesanan?status=verifying
 *   - Cocokkan amount di mutasi GoPay Saya → klik "Konfirmasi"
 *   - verifyPayment() → status: verifying → paid + trigger fulfillment notif
 *
 * Reject flow (admin):
 *   - Admin tidak nemu mutasi setelah cukup waktu / amount salah
 *   - rejectPayment(reason) → status: cancelled
 */
export class ManualPaymentService {
  /**
   * Setup pembayaran manual untuk order baru. Inject unique suffix ke total_idr,
   * generate QRIS Dinamis payload, persist ke order.
   *
   * Dipanggil dari CheckoutService.createOrder setelah insertOrderWithRetry.
   */
  static async setupManualPayment(orderId: string): Promise<CreateManualPaymentResult> {
    const supabase = createAdminClient()
    const staticPayload = process.env.QRIS_STATIC_PAYLOAD?.trim()
    if (!staticPayload) {
      throw new ApiError(
        'INTERNAL_ERROR',
        'QRIS_STATIC_PAYLOAD env var belum di-set. Admin harus konfigurasi via wrangler secret.',
        500,
      )
    }

    // Fetch order untuk dapat total_idr awal
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, total_idr, status, expires_at')
      .eq('id', orderId)
      .maybeSingle()
    if (error || !order) {
      throw new ApiError('NOT_FOUND', 'Order tidak ditemukan', 404)
    }
    if (order.status !== 'pending_payment') {
      throw new ApiError('PAYMENT_INVALID', 'Order tidak dalam status menunggu pembayaran', 400)
    }

    const baseAmount = order.total_idr as number

    // Generate unique suffix, retry kalau collision dengan pending order lain.
    // DB unique partial index `idx_orders_pending_unique_amount` sebagai final
    // guard supaya race condition tidak bikin 2 order dengan total_idr sama.
    let suffix = 0
    let finalAmount = baseAmount
    let attempt = 0
    while (attempt < SUFFIX_RETRY_LIMIT) {
      suffix = generateUniqueSuffix()
      finalAmount = baseAmount + suffix
      const { data: clash } = await supabase
        .from('orders')
        .select('id')
        .eq('total_idr', finalAmount)
        .in('status', ['pending_payment', 'verifying'])
        .neq('id', orderId)
        .maybeSingle()
      if (!clash) break
      attempt += 1
    }
    if (attempt >= SUFFIX_RETRY_LIMIT) {
      throw new ApiError(
        'INTERNAL_ERROR',
        'Gagal generate unique suffix setelah 30 percobaan — terlalu banyak pending order',
        500,
      )
    }

    // Generate QRIS Dinamis dengan amount injected
    let dynamicPayload: string
    try {
      dynamicPayload = injectAmount(staticPayload, finalAmount)
    } catch (err) {
      throw new ApiError(
        'INTERNAL_ERROR',
        `Gagal generate QRIS Dinamis: ${err instanceof Error ? err.message : String(err)}`,
        500,
      )
    }

    // Update order dengan suffix + adjusted total_idr
    const { error: updErr } = await supabase
      .from('orders')
      .update({
        total_idr: finalAmount,
        payment_unique_suffix: suffix,
      })
      .eq('id', orderId)
    if (updErr) {
      throw new ApiError('INTERNAL_ERROR', `update order: ${updErr.message}`, 500)
    }

    return {
      order_id: orderId,
      order_number: order.order_number as string,
      total_idr: finalAmount,
      unique_suffix: suffix,
      qris_dynamic_payload: dynamicPayload,
      expires_at: order.expires_at as string,
    }
  }

  /**
   * Re-generate QRIS Dinamis untuk order yang sudah punya suffix.
   * Dipakai saat buyer buka ulang order page (status masih pending_payment).
   */
  static async regenerateQrForPendingOrder(orderId: string, userId: string): Promise<{
    order_id: string
    order_number: string
    total_idr: number
    unique_suffix: number
    qris_dynamic_payload: string
    expires_at: string
    status: string
    payment_claimed_at: string | null
  }> {
    const supabase = createAdminClient()
    const staticPayload = process.env.QRIS_STATIC_PAYLOAD?.trim()
    if (!staticPayload) {
      throw new ApiError('INTERNAL_ERROR', 'QRIS_STATIC_PAYLOAD belum di-set', 500)
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, total_idr, status, expires_at, payment_unique_suffix, payment_claimed_at, user_id')
      .eq('id', orderId)
      .maybeSingle()
    if (!order) throw new ApiError('NOT_FOUND', 'Order tidak ditemukan', 404)
    if (order.user_id !== userId) throw new ApiError('AUTH_FORBIDDEN', 'Order bukan milik Anda', 403)
    if (order.payment_unique_suffix === null) {
      throw new ApiError('VALIDATION_ERROR', 'Order ini belum di-setup manual payment', 400)
    }

    const dynamicPayload = injectAmount(staticPayload, order.total_idr as number)
    return {
      order_id: order.id as string,
      order_number: order.order_number as string,
      total_idr: order.total_idr as number,
      unique_suffix: order.payment_unique_suffix as number,
      qris_dynamic_payload: dynamicPayload,
      expires_at: order.expires_at as string,
      status: order.status as string,
      payment_claimed_at: order.payment_claimed_at as string | null,
    }
  }

  /**
   * Buyer klaim "Saya sudah bayar". Status: pending_payment → verifying.
   * Trigger admin alert WA + email fallback.
   */
  static async claimPaid(orderId: string, userId: string): Promise<{ ok: true; order_number: string }> {
    const supabase = createAdminClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, status, user_id, total_idr, payment_unique_suffix, product_id')
      .eq('id', orderId)
      .maybeSingle()
    if (!order) throw new ApiError('NOT_FOUND', 'Order tidak ditemukan', 404)
    if (order.user_id !== userId) throw new ApiError('AUTH_FORBIDDEN', 'Order bukan milik Anda', 403)
    if (order.status !== 'pending_payment') {
      throw new ApiError('VALIDATION_ERROR', `Status ${order.status} tidak bisa di-klaim`, 400)
    }

    // Update status — guard idempotent via eq pending_payment
    const now = new Date().toISOString()
    const { error: updErr, data: updated } = await supabase
      .from('orders')
      .update({ status: 'verifying', payment_claimed_at: now })
      .eq('id', orderId)
      .eq('status', 'pending_payment')
      .select('order_number')
      .maybeSingle()
    if (updErr) throw new ApiError('INTERNAL_ERROR', updErr.message, 500)
    if (!updated) {
      throw new ApiError('VALIDATION_ERROR', 'Order sudah di-klaim sebelumnya', 409)
    }

    await ActivityLogService.log({
      event_type: 'order_paid', // re-use existing event, atau bisa tambah 'order_verifying' nanti
      ref_id: order.id as string,
      ref_table: 'orders',
      title: `Buyer klaim bayar: ${order.order_number}`,
      description: `Expected Rp ${(order.total_idr as number).toLocaleString('id-ID')} (suffix ${order.payment_unique_suffix})`,
      metadata: {
        order_id: order.id,
        amount: order.total_idr,
        suffix: order.payment_unique_suffix,
      },
    })

    // Admin alert
    try {
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', order.product_id)
        .maybeSingle()
      await NotificationService.sendAdminAlert({
        template: 'admin_verify_payment',
        title: 'Verifikasi Pembayaran',
        message:
          `Order ${order.order_number} (${product?.name ?? 'produk'}) — buyer klaim sudah bayar.\n` +
          `Expected: Rp ${(order.total_idr as number).toLocaleString('id-ID')}\n` +
          `Suffix: ${order.payment_unique_suffix}\n\n` +
          `Cek mutasi GoPay → cocokkan amount → konfirmasi di:\n` +
          `${process.env.PUBLIC_SITE_URL}/admin/pesanan?status=verifying`,
      })
    } catch (err) {
      console.warn('[manual-payment] admin alert claim failed:', err)
    }

    return { ok: true, order_number: order.order_number as string }
  }

  /**
   * Admin konfirmasi pembayaran masuk (lihat di mutasi GoPay). Status:
   * verifying → paid + trigger PaymentService.handlePaid (reuse logic
   * existing untuk emit notif buyer + admin pending fulfillment).
   */
  static async verifyPayment(orderId: string, adminId: string): Promise<VerifyResult> {
    const supabase = createAdminClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, status, user_id, product_id, total_idr')
      .eq('id', orderId)
      .maybeSingle()
    if (!order) throw new ApiError('NOT_FOUND', 'Order tidak ditemukan', 404)
    if (order.status !== 'verifying') {
      throw new ApiError('VALIDATION_ERROR', `Status ${order.status} tidak bisa di-verify`, 400)
    }

    const now = new Date().toISOString()
    const { error: updErr, data: updated } = await supabase
      .from('orders')
      .update({ status: 'paid', payment_verified_at: now, paid_at: now })
      .eq('id', orderId)
      .eq('status', 'verifying')
      .select('order_number')
      .maybeSingle()
    if (updErr) throw new ApiError('INTERNAL_ERROR', updErr.message, 500)
    if (!updated) {
      throw new ApiError('VALIDATION_ERROR', 'Order sudah di-verify sebelumnya', 409)
    }

    await ActivityLogService.log({
      event_type: 'order_paid',
      ref_id: order.id as string,
      ref_table: 'orders',
      title: `Pembayaran terverifikasi: ${order.order_number}`,
      description: `Rp ${(order.total_idr as number).toLocaleString('id-ID')} · verified oleh admin ${adminId.slice(0, 8)}`,
      metadata: { order_id: order.id, amount: order.total_idr, admin_id: adminId },
    })

    // Trigger downstream notif (buyer payment received + admin fulfillment alert).
    // Reuse PaymentService.handlePaid post-update side effects via direct call.
    try {
      await PaymentService.notifyBuyerPaymentReceived({
        id: order.id as string,
        user_id: order.user_id as string,
        product_id: order.product_id as string,
        order_number: order.order_number as string,
        total_idr: order.total_idr as number,
        status: 'paid',
      })
    } catch (err) {
      console.warn('[manual-payment] notify buyer paid failed:', err)
    }

    return { ok: true, order_number: order.order_number as string }
  }

  /**
   * Admin reject pembayaran (tidak nemu mutasi / amount salah). Status:
   * verifying → cancelled dengan reason. Buyer dapat notif.
   */
  static async rejectPayment(orderId: string, adminId: string, reason: string): Promise<RejectResult> {
    const supabase = createAdminClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, status, user_id, total_idr, product_id')
      .eq('id', orderId)
      .maybeSingle()
    if (!order) throw new ApiError('NOT_FOUND', 'Order tidak ditemukan', 404)
    if (order.status !== 'verifying') {
      throw new ApiError('VALIDATION_ERROR', `Status ${order.status} tidak bisa di-reject`, 400)
    }

    const { error: updErr, data: updated } = await supabase
      .from('orders')
      .update({ status: 'cancelled', payment_rejected_reason: reason })
      .eq('id', orderId)
      .eq('status', 'verifying')
      .select('order_number')
      .maybeSingle()
    if (updErr) throw new ApiError('INTERNAL_ERROR', updErr.message, 500)
    if (!updated) {
      throw new ApiError('VALIDATION_ERROR', 'Order sudah di-handle sebelumnya', 409)
    }

    await ActivityLogService.log({
      event_type: 'order_refunded', // re-use closest event type
      ref_id: order.id as string,
      ref_table: 'orders',
      title: `Pembayaran di-reject: ${order.order_number}`,
      description: `Alasan: ${reason.slice(0, 150)}`,
      metadata: { order_id: order.id, reason, admin_id: adminId },
    })

    // Notif buyer — pembayaran tidak ditemukan, kontak admin untuk klarifikasi
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_wa')
        .eq('id', order.user_id)
        .maybeSingle()
      const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id as string)
      const email = authUser.user?.email
      const fullName = profile?.full_name ?? 'Buyer'
      const tpl = templates.paymentRejected({
        fullName,
        orderNumber: order.order_number as string,
        amount: order.total_idr as number,
        reason,
      })
      if (profile?.phone_wa) {
        await NotificationService.sendWhatsApp({
          target: profile.phone_wa,
          message: tpl.waText,
          template: tpl.template,
          userId: order.user_id as string,
          orderId: order.id as string,
        })
      }
      if (email) {
        await NotificationService.sendEmail({
          to: email,
          subject: tpl.emailSubject,
          html: tpl.emailHtml,
          template: tpl.template,
          userId: order.user_id as string,
          orderId: order.id as string,
        })
      }
    } catch (err) {
      console.warn('[manual-payment] notify buyer rejected failed:', err)
    }

    return { ok: true, order_number: order.order_number as string }
  }
}
