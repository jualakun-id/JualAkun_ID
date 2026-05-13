import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'
import { ManualPaymentService } from './manual-payment.service'
import { ActivityLogService } from './activity-log.service'
import { NotificationService } from './notification.service'
import { templates } from '@/templates/messages'

type CreateOrderInput = {
  product_id: string
  coupon_code?: string
  use_credits?: boolean
  phone_wa?: string
}

type CreateOrderResult = {
  order_id: string
  order_number: string
  amount_idr: number          // harga product asli (sebelum suffix)
  discount_idr: number
  credit_used_idr: number
  total_idr: number           // final dengan unique suffix (e.g. 75123)
  unique_suffix: number        // 3-digit suffix untuk admin identify
  qris_dynamic_payload: string // payload untuk render QR di frontend
  expires_at: string
}

type CouponRpcResult = {
  ok: boolean
  code?: string
  coupon_id?: string
  discount_type?: 'percent' | 'fixed'
  discount_value?: number
  discount_idr?: number
  final_idr?: number
}

/**
 * Normalize Indonesian phone numbers:
 *   08xxx → 628xxx
 *   +628xxx → 628xxx
 *   628xxx → 628xxx
 * Returns null if format is unrecognized.
 */
function normalizePhoneWa(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  // E.164 normalized (62 = ID, 60 = MY, dst.)
  if (digits.startsWith('62') || digits.startsWith('60')) return digits
  // Fallback Indonesia local format
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('8')) return `62${digits}`
  return null
}

/**
 * Generate a JA-YYYYMMDD-NNNNN style order number using a 5-char random suffix.
 * The DB UNIQUE constraint guarantees correctness; we retry on collision.
 */
function generateOrderNumber(): string {
  const now = new Date()
  const yyyymmdd = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(
    now.getUTCDate(),
  ).padStart(2, '0')}`
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 5)
    .toUpperCase()
  return `JA-${yyyymmdd}-${suffix}`
}

export class CheckoutService {
  static async createOrder(userId: string, input: CreateOrderInput): Promise<CreateOrderResult> {
    const supabase = createAdminClient()

    // 1. Validate product
    const { data: product, error: productErr } = await supabase
      .from('products')
      .select('id, name, price, display_stock, is_active')
      .eq('id', input.product_id)
      .maybeSingle()

    if (productErr || !product) {
      throw new ApiError('NOT_FOUND', 'Produk tidak ditemukan', 404)
    }
    if (!product.is_active) {
      throw new ApiError('NOT_FOUND', 'Produk tidak tersedia', 404)
    }
    if (product.display_stock === 0) {
      throw new ApiError('STOCK_EMPTY', 'Stok produk habis — silakan pilih produk lain', 400)
    }

    const amountIdr: number = product.price

    // 2. Validate coupon (RPC)
    let discountIdr = 0
    let appliedCouponCode: string | null = null
    if (input.coupon_code && input.coupon_code.trim().length > 0) {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('validate_coupon', {
        p_code: input.coupon_code.trim(),
        p_product_id: input.product_id,
        p_amount_idr: amountIdr,
      })
      if (rpcErr) {
        throw new ApiError('INTERNAL_ERROR', `validate_coupon RPC: ${rpcErr.message}`, 500)
      }
      const result = rpcData as CouponRpcResult | null
      if (!result?.ok) {
        throw new ApiError('COUPON_INVALID', 'Kode kupon tidak valid', 400, { code: result?.code })
      }
      discountIdr = result.discount_idr ?? 0
      appliedCouponCode = input.coupon_code.trim().toUpperCase()
    }

    const afterDiscount = Math.max(0, amountIdr - discountIdr)

    // 3. Apply credits (clamp to available + after-discount amount)
    let creditUsedIdr = 0
    if (input.use_credits) {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .maybeSingle()
      if (profileErr || !profile) {
        throw new ApiError('NOT_FOUND', 'Profil tidak ditemukan', 404)
      }
      creditUsedIdr = Math.min(profile.credits ?? 0, afterDiscount)
    }

    const totalIdr = afterDiscount - creditUsedIdr

    // 4. Update profile.phone_wa if provided
    if (input.phone_wa) {
      const normalized = normalizePhoneWa(input.phone_wa)
      if (!normalized) {
        throw new ApiError('VALIDATION_ERROR', 'Format nomor WhatsApp tidak valid', 400)
      }
      await supabase.from('profiles').update({ phone_wa: normalized }).eq('id', userId)
    }

    // 5. Insert order — retry on order_number unique-collision (rare)
    const insertedOrder = await this.insertOrderWithRetry({
      user_id: userId,
      product_id: product.id,
      amount_idr: amountIdr,
      discount_idr: discountIdr,
      credit_used_idr: creditUsedIdr,
      total_idr: totalIdr,
      coupon_code: appliedCouponCode,
    })

    // 6. Decrement buyer credits atomically via RPC (migrasi 013)
    if (creditUsedIdr > 0) {
      const { data: deductResult, error: deductErr } = await supabase.rpc('deduct_user_credits', {
        p_user_id: userId,
        p_amount: creditUsedIdr,
      })
      if (deductErr) {
        throw new ApiError('INTERNAL_ERROR', `deduct_user_credits: ${deductErr.message}`, 500)
      }
      const r = deductResult as { ok: boolean; code?: string }
      if (!r?.ok) {
        throw new ApiError('VALIDATION_ERROR', 'Saldo kredit tidak cukup', 400, {
          code: r?.code ?? 'INSUFFICIENT_CREDITS',
        })
      }
    }

    // 7. Increment coupon usage
    if (appliedCouponCode) {
      await supabase.rpc('increment_coupon_usage', { p_code: appliedCouponCode })
    }

    // 8. Setup manual payment — inject unique 3-digit suffix ke total_idr +
    //    generate QRIS Dinamis payload. Buyer transfer ke QRIS Statis admin
    //    (GoPay Saya) dengan amount yang sudah include suffix, admin verify
    //    manual dari mutasi app.
    const tx = await ManualPaymentService.setupManualPayment(insertedOrder.id)
    const finalTotalIdr = tx.total_idr // already includes suffix

    // 9. Activity log emit
    await ActivityLogService.log({
      event_type: 'order_created',
      ref_id: insertedOrder.id,
      ref_table: 'orders',
      title: `Order baru: ${insertedOrder.order_number}`,
      description: `${product.name} · Rp ${finalTotalIdr.toLocaleString('id-ID')} (suffix ${tx.unique_suffix}) · menunggu pembayaran`,
      metadata: { product_id: product.id, user_id: userId, amount_idr: amountIdr, total_idr: finalTotalIdr, unique_suffix: tx.unique_suffix },
    })
    if (appliedCouponCode) {
      await ActivityLogService.log({
        event_type: 'coupon_used',
        ref_id: insertedOrder.id,
        ref_table: 'orders',
        title: `Kupon dipakai: ${appliedCouponCode}`,
        description: `Order ${insertedOrder.order_number} · diskon Rp ${discountIdr.toLocaleString('id-ID')}`,
        metadata: { coupon_code: appliedCouponCode, discount_idr: discountIdr, order_id: insertedOrder.id },
      })
    }
    if (creditUsedIdr > 0) {
      await ActivityLogService.log({
        event_type: 'referral_redeemed',
        ref_id: insertedOrder.id,
        ref_table: 'orders',
        title: `Kredit referral dipakai`,
        description: `Order ${insertedOrder.order_number} · kredit Rp ${creditUsedIdr.toLocaleString('id-ID')}`,
        metadata: { credit_used_idr: creditUsedIdr, user_id: userId, order_id: insertedOrder.id },
      })
    }

    // 10. Notif buyer order created — kirim link order detail untuk lanjut bayar
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_wa')
        .eq('id', userId)
        .maybeSingle()
      const { data: authUser } = await supabase.auth.admin.getUserById(userId)
      const userEmail = authUser.user?.email
      const orderDetailUrl = `${process.env.PUBLIC_SITE_URL}/dashboard/pesanan/${insertedOrder.id}`
      const tpl = templates.orderCreated({
        fullName: profile?.full_name ?? 'Buyer',
        orderNumber: insertedOrder.order_number,
        productName: product.name,
        totalIdr: finalTotalIdr,
        snapUrl: orderDetailUrl, // link ke order detail (bukan popup payment)
      })
      if (profile?.phone_wa) {
        await NotificationService.sendWhatsApp({
          target: profile.phone_wa,
          message: tpl.waText,
          template: tpl.template,
          userId,
          orderId: insertedOrder.id,
        })
      }
      if (userEmail) {
        await NotificationService.sendEmail({
          to: userEmail,
          subject: tpl.emailSubject,
          html: tpl.emailHtml,
          template: tpl.template,
          userId,
          orderId: insertedOrder.id,
        })
      }
    } catch (notifErr) {
      console.warn('[checkout] notify order_created failed (non-blocking):', notifErr)
    }

    return {
      order_id: insertedOrder.id,
      order_number: insertedOrder.order_number,
      amount_idr: amountIdr,
      discount_idr: discountIdr,
      credit_used_idr: creditUsedIdr,
      total_idr: finalTotalIdr,
      unique_suffix: tx.unique_suffix,
      qris_dynamic_payload: tx.qris_dynamic_payload,
      expires_at: insertedOrder.expires_at,
    }
  }

  private static async insertOrderWithRetry(payload: {
    user_id: string
    product_id: string
    amount_idr: number
    discount_idr: number
    credit_used_idr: number
    total_idr: number
    coupon_code: string | null
  }): Promise<{ id: string; order_number: string; expires_at: string }> {
    const supabase = createAdminClient()
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const orderNumber = generateOrderNumber()
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...payload,
          order_number: orderNumber,
          status: 'pending_payment',
        })
        .select('id, order_number, expires_at')
        .single()

      if (!error && data) {
        return data as { id: string; order_number: string; expires_at: string }
      }
      // 23505 = unique_violation
      if (error?.code === '23505' && attempt < maxAttempts) continue
      throw new ApiError('INTERNAL_ERROR', `Gagal membuat order: ${error?.message ?? 'unknown'}`, 500)
    }
    throw new ApiError('INTERNAL_ERROR', 'Gagal membuat order setelah retry', 500)
  }

}
