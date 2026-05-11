import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'
import { CryptoService } from './crypto.service'
import { DeliveryService } from './delivery.service'
import { NotificationService } from './notification.service'
import { PaymentService } from './payment.service'
import { SupplierCanbosoService } from './supplier.service'

/**
 * Extract path dalam bucket dari public URL Supabase Storage.
 * Contoh:
 *   "https://xxx.supabase.co/storage/v1/object/public/product-thumbnails/abc-123.webp"
 *   → "abc-123.webp"
 * Return null kalau URL bukan dari bucket yang dimaksud (mis. external CDN).
 */
function extractBucketPath(url: string, bucket: string): string | null {
  // Hapus query string dulu (kalau ada ?v=2 cache-bust)
  const clean = url.split('?')[0]
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = clean.indexOf(marker)
  if (idx === -1) return null
  return clean.slice(idx + marker.length)
}

export class AdminProductsService {
  static async list(q: {
    status?: string
    category_slug?: string
    search?: string
    page: number
    limit: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    const supabase = createAdminClient()
    const offset = (q.page - 1) * q.limit
    // Default sort: created_at desc (terbaru first). Override kalau client kirim sort_by.
    const sortColumn = q.sort_by ?? 'created_at'
    const sortAsc = q.sort_dir === 'asc'

    let query = supabase
      .from('products')
      .select(
        `id, name, slug, price, duration_days, guarantee_days, stock_count, display_stock, sold_count,
         is_active, thumbnail_url, created_at,
         categories!inner ( name, slug )`,
        { count: 'exact' },
      )
      .order(sortColumn, { ascending: sortAsc })
      .range(offset, offset + q.limit - 1)

    if (q.status === 'active') query = query.eq('is_active', true)
    if (q.status === 'draft') query = query.eq('is_active', false)
    if (q.status === 'out_of_stock') query = query.eq('display_stock', 0)
    if (q.category_slug) query = query.eq('categories.slug', q.category_slug)
    if (q.search) {
      // ilike search di name OR slug — escape % dan komma untuk safety
      const safe = q.search.replace(/[%,()]/g, '')
      query = query.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`)
    }

    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return {
      products: data ?? [],
      pagination: { page: q.page, limit: q.limit, total: count ?? 0 },
    }
  }

  static async create(input: {
    category_id: string
    name: string
    slug: string
    description?: string
    thumbnail_url?: string | null
    duration_days: number
    price: number
    guarantee_days?: number
    is_active?: boolean
    original_price?: number | null
    discount_starts_at?: string | null
    discount_ends_at?: string | null
    display_stock?: number
    supplier_product_id?: string | null
  }) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...input,
        is_active: input.is_active ?? false,
        guarantee_days: input.guarantee_days ?? 30,
      })
      .select('*')
      .single()
    if (error) {
      if (error.code === '23505') throw new ApiError('VALIDATION_ERROR', 'Slug sudah dipakai', 409)
      if (error.code === '23514') throw new ApiError('VALIDATION_ERROR', 'Harga diskon harus lebih kecil dari harga asli', 400)
      throw new ApiError('INTERNAL_ERROR', error.message, 500)
    }
    return data
  }

  static async update(
    id: string,
    input: Partial<{
      name: string
      description: string
      thumbnail_url: string | null
      duration_days: number
      price: number
      guarantee_days: number
      is_active: boolean
      category_id: string
      original_price: number | null
      discount_starts_at: string | null
      discount_ends_at: string | null
      display_stock: number
      supplier_product_id: string | null
    }>,
  ) {
    const supabase = createAdminClient()

    // Kalau payload include thumbnail_url, cek apakah replacing — kalau iya hapus file lama
    // dari Storage supaya nggak orphan (akumulasi storage)
    if ('thumbnail_url' in input) {
      const { data: current } = await supabase
        .from('products')
        .select('thumbnail_url')
        .eq('id', id)
        .single()
      const oldUrl = current?.thumbnail_url as string | null | undefined
      const newUrl = input.thumbnail_url ?? null
      if (oldUrl && oldUrl !== newUrl) {
        const oldPath = extractBucketPath(oldUrl, 'product-thumbnails')
        if (oldPath) {
          // Fire-and-forget delete — kalau gagal, log tapi jangan block update
          const { error: delErr } = await supabase.storage
            .from('product-thumbnails')
            .remove([oldPath])
          if (delErr) {
            console.warn('[products.update] gagal delete old thumbnail:', oldPath, delErr.message)
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      if (error.code === '23514')
        throw new ApiError('VALIDATION_ERROR', 'Harga diskon harus lebih kecil dari harga asli', 400)
      throw new ApiError('INTERNAL_ERROR', error.message, 500)
    }
    return data
  }

  static async deactivate(id: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
  }

  static async getOne(id: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active, stock_count, display_stock, sold_count, original_price, discount_starts_at, discount_ends_at, supplier_product_id, supplier_synced_at')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!data) throw new ApiError('NOT_FOUND', 'Produk tidak ditemukan', 404)

    // Modal stats 30 hari terakhir — untuk hint pricing dynamic di form
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: costRows } = await supabase
      .from('orders')
      .select('cost_idr, total_idr')
      .eq('product_id', id)
      .eq('status', 'delivered')
      .not('cost_idr', 'is', null)
      .gte('delivered_at', thirtyDaysAgo)

    let cost_stats: {
      sample_size: number
      avg_cost_idr: number
      avg_revenue_idr: number
      avg_margin_pct: number
    } | null = null
    if (costRows && costRows.length > 0) {
      const n = costRows.length
      const totalCost = costRows.reduce((s, r) => s + (r.cost_idr ?? 0), 0)
      const totalRev = costRows.reduce((s, r) => s + (r.total_idr ?? 0), 0)
      const avgCost = Math.round(totalCost / n)
      const avgRev = Math.round(totalRev / n)
      const avgMarginPct = avgRev > 0 ? Math.round(((avgRev - avgCost) / avgRev) * 100) : 0
      cost_stats = {
        sample_size: n,
        avg_cost_idr: avgCost,
        avg_revenue_idr: avgRev,
        avg_margin_pct: avgMarginPct,
      }
    }

    return { ...data, cost_stats }
  }

  static async addStock(productId: string, accounts: { credentials: string; note?: string }[]) {
    const supabase = createAdminClient()
    const rows = await Promise.all(
      accounts.map(async (a) => ({
        product_id: productId,
        credentials_enc: await CryptoService.encrypt(a.credentials),
        note: a.note ?? null,
      })),
    )
    const { error } = await supabase.from('account_stock').insert(rows)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    const { data: prod } = await supabase
      .from('products')
      .select('stock_count')
      .eq('id', productId)
      .maybeSingle()
    return { added: rows.length, total_stock: prod?.stock_count ?? 0 }
  }

  /**
   * List semua stok untuk produk — credentials TIDAK di-return (cuma metadata).
   * Sort FIFO: created_at ASC (yang lama duluan terkirim).
   */
  static async listStock(productId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('account_stock')
      .select('id, note, is_used, used_at, order_id, created_at')
      .eq('product_id', productId)
      .order('is_used', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return data ?? []
  }

  /**
   * Hard delete stok item — HANYA boleh kalau `is_used=false` (belum terjual).
   * Stok yang sudah di-deliver ke buyer tidak boleh dihapus (audit trail).
   * Trigger DB auto-sync `products.stock_count`.
   */
  static async deleteStock(productId: string, stockId: string) {
    const supabase = createAdminClient()
    const { data: row, error: selErr } = await supabase
      .from('account_stock')
      .select('id, product_id, is_used')
      .eq('id', stockId)
      .maybeSingle()
    if (selErr) throw new ApiError('INTERNAL_ERROR', selErr.message, 500)
    if (!row) throw new ApiError('NOT_FOUND', 'Stok tidak ditemukan', 404)
    if (row.product_id !== productId)
      throw new ApiError('VALIDATION_ERROR', 'Stok bukan milik produk ini', 400)
    if (row.is_used)
      throw new ApiError('VALIDATION_ERROR', 'Stok ini sudah terjual — tidak bisa dihapus', 400)

    const { error: delErr } = await supabase.from('account_stock').delete().eq('id', stockId)
    if (delErr) throw new ApiError('INTERNAL_ERROR', delErr.message, 500)
    return { ok: true }
  }

  static async addStockBulkCsv(productId: string, csvText: string) {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const errors: string[] = []
    const accounts: { credentials: string; note?: string }[] = []
    lines.forEach((line, i) => {
      const [credentials, ...noteParts] = parseCsvRow(line)
      if (!credentials || !credentials.includes(':')) {
        errors.push(`Row ${i + 1}: format invalid (perlu email:password)`)
        return
      }
      accounts.push({ credentials: credentials.trim(), note: noteParts.join(',').trim() || undefined })
    })
    if (accounts.length === 0) {
      throw new ApiError('VALIDATION_ERROR', 'Tidak ada baris valid di CSV', 400, { errors })
    }
    const result = await this.addStock(productId, accounts)
    return { added: result.added, rejected: errors.length, errors }
  }
}

function parseCsvRow(line: string): string[] {
  return line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
}

export class AdminOrdersService {
  static async list(q: {
    status?: string
    search?: string
    page: number
    limit: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    const supabase = createAdminClient()
    const offset = (q.page - 1) * q.limit
    const sortColumn = q.sort_by ?? 'created_at'
    const sortAsc = q.sort_dir === 'asc'

    let query = supabase
      .from('orders')
      .select(
        `id, order_number, total_idr, status, payment_method, payment_status,
         created_at, paid_at, delivered_at,
         products!inner ( name ),
         user_id`,
        { count: 'exact' },
      )
      .order(sortColumn, { ascending: sortAsc })
      .range(offset, offset + q.limit - 1)

    if (q.status) query = query.eq('status', q.status)
    if (q.search) query = query.or(`order_number.ilike.%${q.search}%`)

    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return {
      orders: data ?? [],
      pagination: { page: q.page, limit: q.limit, total: count ?? 0 },
    }
  }

  static async getOne(orderId: string) {
    const supabase = createAdminClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `id, order_number, amount_idr, discount_idr, credit_used_idr, total_idr, coupon_code,
         status, payment_provider, payment_method, payment_status, payment_transaction_id,
         paid_at, delivered_at, created_at, expires_at, user_id,
         cost_idr, cost_usd, cost_source,
         products!inner ( name, slug, supplier_product_id )`,
      )
      .eq('id', orderId)
      .maybeSingle()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!order) throw new ApiError('NOT_FOUND', 'Pesanan tidak ditemukan', 404)

    const { data: authUser } = await supabase.auth.admin.getUserById((order as { user_id: string }).user_id)

    const { data: notifications } = await supabase
      .from('notifications_log')
      .select('id, channel, template, status, error, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    const productRel = (order as { products: { name: string; slug: string; supplier_product_id: string | null } | { name: string; slug: string; supplier_product_id: string | null }[] }).products
    const product = Array.isArray(productRel) ? productRel[0] : productRel

    return {
      ...order,
      products: undefined,
      product,
      buyer: { email: authUser.user?.email ?? null },
      notifications: notifications ?? [],
    }
  }

  static async manualDeliver(orderId: string) {
    const supabase = createAdminClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .maybeSingle()
    if (!order) throw new ApiError('NOT_FOUND', 'Pesanan tidak ditemukan', 404)
    if (!['paid', 'delivery_failed'].includes(order.status)) {
      throw new ApiError('VALIDATION_ERROR', 'Order tidak bisa di-deliver dari status saat ini', 400)
    }
    if (order.status === 'delivery_failed') {
      await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id)
    }
    await DeliveryService.deliverOrder(orderId)
    return { ok: true, delivered: true }
  }

  /**
   * Manual fulfillment (Opsi A — model on-demand).
   * Admin input credentials saat order sudah paid. Flow:
   *  1. Validate order status === 'paid' (atau 'delivery_failed' untuk retry)
   *  2. Encrypt credentials → insert account_stock (is_used=true, order_id, used_at)
   *  3. Update order: status='delivered', delivered_at=now
   *  4. Decrement products.display_stock (atomic via RPC)
   *  5. Trigger notif credentials ke buyer (email + WA)
   */
  static async fulfillManual(
    orderId: string,
    payload: {
      credentials: string
      note?: string
      cost_idr: number
      cost_usd?: number
      cost_source: 'supplier_canboso' | 'manual' | 'unknown'
    },
  ) {
    const supabase = createAdminClient()

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, product_id, order_number, total_idr, status, guarantee_expires_at')
      .eq('id', orderId)
      .maybeSingle()
    if (orderErr) throw new ApiError('INTERNAL_ERROR', orderErr.message, 500)
    if (!order) throw new ApiError('NOT_FOUND', 'Pesanan tidak ditemukan', 404)
    if (!['paid', 'delivery_failed'].includes(order.status)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Order status saat ini '${order.status}' — hanya bisa fulfill dari 'paid' atau 'delivery_failed'`,
        400,
      )
    }

    const credentialsEnc = await CryptoService.encrypt(payload.credentials)
    const { data: stockRow, error: stockErr } = await supabase
      .from('account_stock')
      .insert({
        product_id: order.product_id,
        credentials_enc: credentialsEnc,
        note: payload.note?.trim() || null,
        is_used: true,
        used_at: new Date().toISOString(),
        order_id: order.id,
      })
      .select('id')
      .single()
    if (stockErr) throw new ApiError('INTERNAL_ERROR', `insert stock: ${stockErr.message}`, 500)

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        cost_idr: payload.cost_idr,
        cost_usd: payload.cost_usd ?? null,
        cost_source: payload.cost_source,
      })
      .eq('id', order.id)
    if (updateErr) {
      // Rollback stock insert
      await supabase.from('account_stock').delete().eq('id', stockRow.id)
      throw new ApiError('INTERNAL_ERROR', `update order: ${updateErr.message}`, 500)
    }

    // Decrement display_stock (atomic, floor 0). Non-blocking — kalau gagal, log saja.
    const { error: decErr } = await supabase.rpc('decrement_display_stock', { p_product_id: order.product_id })
    if (decErr) console.warn('[fulfill] decrement_display_stock failed:', decErr.message)

    // Kirim notif credentials ke buyer (reuse logic dari PaymentService).
    try {
      await PaymentService.notifyBuyerDelivered({
        id: order.id,
        user_id: order.user_id,
        product_id: order.product_id,
        order_number: order.order_number,
        total_idr: order.total_idr,
        status: 'delivered',
      })
    } catch (notifErr) {
      console.error('[fulfill] notify buyer failed:', notifErr)
      // Notif gagal tidak rollback order — credentials sudah masuk, admin bisa resend manual.
    }

    return { ok: true, delivered: true, stock_id: stockRow.id }
  }

  static async updateStatus(orderId: string, status: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
  }

  /**
   * Admin trigger pembelian ke supplier (Canboso) untuk 1 order.
   * Validasi: order harus punya product yang sudah di-link ke supplier_product_id.
   * Tidak auto-fulfill — return raw response untuk admin paste ke Fulfill form.
   */
  static async supplierPurchase(orderId: string) {
    const supabase = createAdminClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, product_id, products!inner(supplier_product_id, name)')
      .eq('id', orderId)
      .maybeSingle()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!order) throw new ApiError('NOT_FOUND', 'Pesanan tidak ditemukan', 404)
    if (!['paid', 'delivery_failed'].includes(order.status)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Order status '${order.status}' — hanya bisa beli ke supplier dari status 'paid' atau 'delivery_failed'`,
        400,
      )
    }

    const productRel = (order as { products: { supplier_product_id: string | null; name: string } | { supplier_product_id: string | null; name: string }[] }).products
    const product = Array.isArray(productRel) ? productRel[0] : productRel
    if (!product?.supplier_product_id) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Produk "${product?.name}" belum di-link ke supplier (set supplier_product_id di form produk)`,
        400,
      )
    }

    return SupplierCanbosoService.purchase(product.supplier_product_id)
  }
}

export class AdminTicketsService {
  static async list(q: {
    status?: string
    search?: string
    page: number
    limit: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    const supabase = createAdminClient()
    const offset = (q.page - 1) * q.limit
    const sortColumn = q.sort_by ?? 'created_at'
    const sortAsc = q.sort_dir === 'asc'

    let query = supabase
      .from('support_tickets')
      .select(
        `id, reason, description, status, created_at, resolved_at,
         orders!inner ( order_number, products ( name ) ),
         user_id`,
        { count: 'exact' },
      )
      .order(sortColumn, { ascending: sortAsc })
      .range(offset, offset + q.limit - 1)
    if (q.status) query = query.eq('status', q.status)
    if (q.search) {
      const safe = q.search.replace(/[%,()]/g, '')
      query = query.ilike('description', `%${safe}%`)
    }
    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { tickets: data ?? [], pagination: { page: q.page, limit: q.limit, total: count ?? 0 } }
  }

  static async getOne(ticketId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('support_tickets')
      .select(
        `id, reason, description, screenshot_url, status, resolution, resolved_at, created_at, user_id,
         orders!inner ( id, order_number, product_id, products ( name ) )`,
      )
      .eq('id', ticketId)
      .maybeSingle()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!data) throw new ApiError('NOT_FOUND', 'Tiket tidak ditemukan', 404)

    const orderRel = (data as { orders: { id: string; order_number: string; product_id: string; products: { name: string } | { name: string }[] } | { id: string; order_number: string; product_id: string; products: { name: string } | { name: string }[] }[] }).orders
    const order = Array.isArray(orderRel) ? orderRel[0] : orderRel
    const productRel = order.products
    const product = Array.isArray(productRel) ? productRel[0] : productRel

    const { data: availableStock } = await supabase
      .from('account_stock')
      .select('id, created_at')
      .eq('product_id', order.product_id)
      .eq('is_used', false)
      .order('created_at')
      .limit(20)

    const { data: authUser } = await supabase.auth.admin.getUserById((data as { user_id: string }).user_id)

    return {
      ...data,
      orders: undefined,
      order: { id: order.id, order_number: order.order_number, product },
      buyer_email: authUser.user?.email ?? null,
      available_stock_ids: (availableStock ?? []).map((s: { id: string }) => s.id),
    }
  }

  static async resolve(
    adminId: string,
    ticketId: string,
    input: { status: string; resolution: string; new_account_stock_id?: string },
  ) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('support_tickets')
      .update({
        status: input.status,
        resolution: input.resolution,
        new_account_stock_id: input.new_account_stock_id ?? null,
        admin_id: adminId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
  }
}

export class AdminCouponsService {
  static async list() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return data ?? []
  }

  static async create(input: {
    code: string
    discount_type: 'percent' | 'fixed'
    discount_value: number
    max_uses?: number
    valid_for_products?: string[]
    expires_at?: string
  }) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...input,
        code: input.code.toUpperCase(),
        is_active: true,
      })
      .select('*')
      .single()
    if (error) {
      if (error.code === '23505') throw new ApiError('VALIDATION_ERROR', 'Kode kupon sudah dipakai', 409)
      throw new ApiError('INTERNAL_ERROR', error.message, 500)
    }
    return data
  }

  static async update(id: string, input: Partial<{ discount_value: number; max_uses: number; expires_at: string; is_active: boolean }>) {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('coupons').update(input).eq('id', id).select('*').single()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return data
  }

  static async deactivate(id: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('coupons').update({ is_active: false }).eq('id', id)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
  }
}

export class AdminDashboardService {
  static async getKpis() {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('get_admin_kpis')
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return data
  }

  static async revenueTrend(days: number) {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 86400_000).toISOString()
    const { data, error } = await supabase
      .from('orders')
      .select('paid_at, total_idr')
      .in('status', ['delivered', 'confirmed'])
      .gte('paid_at', since)
      .order('paid_at', { ascending: true })
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    const buckets = new Map<string, { revenue: number; orders: number }>()
    for (const r of (data ?? []) as { paid_at: string | null; total_idr: number }[]) {
      if (!r.paid_at) continue
      const day = r.paid_at.slice(0, 10)
      const cur = buckets.get(day) ?? { revenue: 0, orders: 0 }
      cur.revenue += r.total_idr
      cur.orders += 1
      buckets.set(day, cur)
    }
    return Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }))
  }

  /**
   * Profit KPI — hari ini & bulan ini.
   * Profit = total_idr - cost_idr untuk order delivered, cost_idr IS NOT NULL.
   * Order pre-migration / cost null di-exclude (avoid skew, jadi sample size
   * jujur). Return juga jumlah delivered tanpa cost (orphan count) supaya
   * admin tau coverage tracking.
   */
  static async getProfitKpis() {
    const supabase = createAdminClient()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const sumProfit = async (sinceIso: string) => {
      const { data, error } = await supabase
        .from('orders')
        .select('cost_idr, total_idr')
        .eq('status', 'delivered')
        .gte('delivered_at', sinceIso)
      if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
      const rows = (data ?? []) as { cost_idr: number | null; total_idr: number }[]
      const withCost = rows.filter((r) => r.cost_idr !== null)
      const revenue = withCost.reduce((s, r) => s + r.total_idr, 0)
      const cost = withCost.reduce((s, r) => s + (r.cost_idr ?? 0), 0)
      return {
        orders_tracked: withCost.length,
        orders_untracked: rows.length - withCost.length,
        revenue_idr: revenue,
        cost_idr: cost,
        profit_idr: revenue - cost,
        margin_pct: revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : 0,
      }
    }

    const [today, month] = await Promise.all([sumProfit(todayStart), sumProfit(monthStart)])
    return { today, this_month: month }
  }

  static async topProducts(limit: number) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sold_count, price, thumbnail_url')
      .eq('is_active', true)
      .order('sold_count', { ascending: false })
      .limit(limit)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return data ?? []
  }
}

export class AdminUsersService {
  static async list(q: {
    search?: string
    page: number
    limit: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    const supabase = createAdminClient()
    const offset = (q.page - 1) * q.limit
    const sortColumn = q.sort_by ?? 'joined_at'
    const sortAsc = q.sort_dir === 'asc'

    let query = supabase
      .from('profiles')
      .select('id, full_name, phone_wa, role, status, credits, joined_at', { count: 'exact' })
      .order(sortColumn, { ascending: sortAsc })
      .range(offset, offset + q.limit - 1)
    if (q.search) query = query.or(`full_name.ilike.%${q.search}%,phone_wa.ilike.%${q.search}%`)
    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { users: data ?? [], pagination: { page: q.page, limit: q.limit, total: count ?? 0 } }
  }

  static async setStatus(userId: string, status: 'active' | 'suspended' | 'banned') {
    const supabase = createAdminClient()
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
  }
}

export class AdminNotificationsService {
  static async list(q: {
    channel?: 'wa' | 'email'
    status?: string
    page: number
    limit: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    const supabase = createAdminClient()
    const offset = (q.page - 1) * q.limit
    const sortColumn = q.sort_by ?? 'created_at'
    const sortAsc = q.sort_dir === 'asc'

    let query = supabase
      .from('notifications_log')
      .select('*', { count: 'exact' })
      .order(sortColumn, { ascending: sortAsc })
      .range(offset, offset + q.limit - 1)
    if (q.channel) query = query.eq('channel', q.channel)
    if (q.status) query = query.eq('status', q.status)
    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { logs: data ?? [], pagination: { page: q.page, limit: q.limit, total: count ?? 0 } }
  }

  static async retry(notificationId: string) {
    const supabase = createAdminClient()
    const { data: log } = await supabase
      .from('notifications_log')
      .select('*')
      .eq('id', notificationId)
      .maybeSingle()
    if (!log) throw new ApiError('NOT_FOUND', 'Notifikasi tidak ditemukan', 404)

    // Stub: rebuild + resend. Production: pakai stored payload.
    const message = `[Retry] ${log.template} (id ${log.id})`
    if (log.channel === 'wa' && log.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_wa')
        .eq('id', log.user_id)
        .maybeSingle()
      if (profile?.phone_wa) {
        await NotificationService.sendWhatsApp({
          target: profile.phone_wa,
          message,
          template: log.template,
          userId: log.user_id,
          orderId: log.order_id,
        })
      }
    }
    return { ok: true }
  }
}

export class AdminStockMonitorService {
  static async list(q: {
    filter: 'all' | 'critical' | 'out'
    category_slug?: string
    search?: string
    page: number
    limit: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    const supabase = createAdminClient()
    const offset = (q.page - 1) * q.limit
    // Default sort: display_stock ASC (habis di atas). Override kalau client kirim sort_by.
    // sort_by 'stock_count' di-remap ke 'display_stock' supaya konsisten dengan model on-demand.
    const sortByRaw = q.sort_by === 'stock_count' ? 'display_stock' : q.sort_by
    const sortColumn = sortByRaw ?? 'display_stock'
    const sortAsc = q.sort_by ? q.sort_dir === 'asc' : true

    let query = supabase
      .from('products')
      .select(
        `id, name, slug, price, duration_days, stock_count, display_stock, sold_count,
         is_active, thumbnail_url,
         categories!inner ( name, slug )`,
        { count: 'exact' },
      )
      .eq('is_active', true)
      .order(sortColumn, { ascending: sortAsc })
      .range(offset, offset + q.limit - 1)

    if (q.filter === 'critical') query = query.lte('display_stock', 5).gt('display_stock', 0)
    if (q.filter === 'out') query = query.eq('display_stock', 0)
    if (q.category_slug) query = query.eq('categories.slug', q.category_slug)
    if (q.search) {
      const safe = q.search.replace(/[%,()]/g, '')
      query = query.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`)
    }

    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return {
      products: data ?? [],
      pagination: { page: q.page, limit: q.limit, total: count ?? 0 },
    }
  }

  /**
   * Aggregate counts untuk subtitle stok monitor (out vs critical) — independent
   * dari pagination/filter, supaya angka di header tetap akurat.
   * Optional category_slug untuk scope counts ke kategori tertentu.
   */
  static async counts(category_slug?: string) {
    const supabase = createAdminClient()
    let outQ = supabase
      .from('products')
      .select('id, categories!inner(slug)', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('display_stock', 0)
    let critQ = supabase
      .from('products')
      .select('id, categories!inner(slug)', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('display_stock', 5)
      .gt('display_stock', 0)
    if (category_slug) {
      outQ = outQ.eq('categories.slug', category_slug)
      critQ = critQ.eq('categories.slug', category_slug)
    }
    const [outRes, critRes] = await Promise.all([outQ, critQ])
    if (outRes.error) throw new ApiError('INTERNAL_ERROR', outRes.error.message, 500)
    if (critRes.error) throw new ApiError('INTERNAL_ERROR', critRes.error.message, 500)
    return { out: outRes.count ?? 0, critical: critRes.count ?? 0 }
  }
}
