import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'
import { CryptoService } from './crypto.service'

const ORDER_STATUSES = [
  'pending_payment', 'verifying', 'paid', 'delivering', 'delivered', 'confirmed',
  'expired', 'cancelled', 'delivery_failed', 'refunded',
] as const
type OrderStatus = (typeof ORDER_STATUSES)[number]

type ListQuery = { status?: OrderStatus; page: number; limit: number }

export class OrdersService {
  static async listForUser(userId: string, q: ListQuery) {
    const supabase = createAdminClient()
    const offset = (q.page - 1) * q.limit
    let query = supabase
      .from('orders')
      .select(
        `id, order_number, total_idr, status, delivered_at, guarantee_expires_at,
         created_at, products!inner ( name, thumbnail_url )`,
        { count: 'exact' },
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + q.limit - 1)

    if (q.status) query = query.eq('status', q.status)

    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    const orders = (data ?? []).map((o: { products: { name: string; thumbnail_url: string | null } | { name: string; thumbnail_url: string | null }[] } & Record<string, unknown>) => {
      const p = Array.isArray(o.products) ? o.products[0] : o.products
      return {
        ...o,
        products: undefined,
        product_name: p?.name,
        product_thumbnail: p?.thumbnail_url,
      }
    })

    return {
      orders,
      pagination: {
        page: q.page,
        limit: q.limit,
        total: count ?? 0,
        total_pages: count ? Math.ceil(count / q.limit) : 0,
      },
    }
  }

  static async getOne(userId: string, orderId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('orders')
      .select(
        `id, order_number, amount_idr, discount_idr, credit_used_idr, total_idr,
         coupon_code, status, payment_method,
         payment_unique_suffix, payment_claimed_at, payment_verified_at, payment_rejected_reason,
         delivered_at, buyer_confirmed_at, guarantee_expires_at, expires_at, created_at,
         products!inner ( id, name, slug, thumbnail_url, duration_days, guarantee_days )`,
      )
      .eq('id', orderId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!data) throw new ApiError('NOT_FOUND', 'Pesanan tidak ditemukan', 404)
    const p = Array.isArray(data.products) ? data.products[0] : data.products
    return { ...data, product: p, products: undefined }
  }

  static async getCredentials(userId: string, orderId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('get_order_credentials', {
      p_order_id: orderId,
      p_user_id: userId,
    })
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    const r = data as { ok: boolean; code?: string; credentials_enc?: string; note?: string; guarantee_expires_at?: string }
    if (!r?.ok) {
      throw new ApiError('NOT_FOUND', 'Akses ditolak atau order belum dikirim', 404, { code: r?.code })
    }
    const decrypted = await CryptoService.decrypt(r.credentials_enc!)
    const [username, password] = decrypted.includes(':') ? decrypted.split(/:(.+)/) : [decrypted, '']
    return {
      credentials: { username: username.trim(), password: (password ?? '').trim(), note: r.note ?? null },
      guarantee_expires_at: r.guarantee_expires_at,
    }
  }

  static async confirmReceived(userId: string, orderId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('confirm_order_received', {
      p_order_id: orderId,
      p_user_id: userId,
    })
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    const r = data as { ok: boolean; code?: string }
    if (!r?.ok) throw new ApiError('NOT_FOUND', 'Order tidak bisa dikonfirmasi', 404, { code: r?.code })
    return { ok: true, status: 'confirmed' as const }
  }
}
