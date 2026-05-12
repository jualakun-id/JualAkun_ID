import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'
import { CryptoService } from './crypto.service'
import { DeliveryService } from './delivery.service'
import { NotificationService } from './notification.service'
import { PaymentService } from './payment.service'
import { SupplierCanbosoService } from './supplier.service'
import { ActivityLogService } from './activity-log.service'
import { templates } from '@/templates/messages'

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
    await ActivityLogService.log({
      event_type: 'product_created',
      ref_id: data.id,
      ref_table: 'products',
      title: `Produk baru: ${data.name}`,
      description: `Slug ${data.slug} · Rp ${data.price.toLocaleString('id-ID')} · ${data.is_active ? 'Aktif' : 'Draft'}`,
      metadata: { product_id: data.id, slug: data.slug, price: data.price, is_active: data.is_active },
    })
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

    // Kalau admin update supplier_product_id (relink ke supplier baru atau
    // unset), clear orphan flags sekaligus — supaya banner orphan tidak
    // nyangkut sampai sync next run. Kalau ID baru ternyata juga tidak ada
    // di supplier, sync berikutnya akan re-set flag lagi (self-correcting,
    // melewati observation window 30 menit dulu).
    const payload: typeof input & {
      supplier_orphan_at?: null
      supplier_orphan_confirmed_at?: null
    } = { ...input }
    if ('supplier_product_id' in input) {
      payload.supplier_orphan_at = null
      payload.supplier_orphan_confirmed_at = null
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
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
        `id, order_number, total_idr, cost_idr, status, payment_method, payment_status,
         created_at, paid_at, delivered_at, expires_at, user_id,
         products!inner ( name, slug, supplier_product_id )`,
        { count: 'exact' },
      )
      .order(sortColumn, { ascending: sortAsc })
      .range(offset, offset + q.limit - 1)

    if (q.status) query = query.eq('status', q.status)
    if (q.search) query = query.or(`order_number.ilike.%${q.search}%`)

    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    // Batch fetch profiles untuk buyer info (orders.user_id → auth.users, jadi
    // gak bisa langsung embed profiles via FK. Pakai separate query).
    const userIds = Array.from(new Set((data ?? []).map((o) => (o as { user_id: string }).user_id).filter(Boolean)))
    const profileMap = new Map<string, { full_name: string | null; phone_wa: string | null }>()
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone_wa')
        .in('id', userIds)
      for (const p of (profiles ?? []) as Array<{ id: string; full_name: string | null; phone_wa: string | null }>) {
        profileMap.set(p.id, { full_name: p.full_name, phone_wa: p.phone_wa })
      }
    }

    const enriched = (data ?? []).map((o) => ({
      ...o,
      profiles: profileMap.get((o as { user_id: string }).user_id) ?? null,
    }))

    return {
      orders: enriched,
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

    // Log activity feed untuk admin
    await ActivityLogService.log({
      event_type: 'order_delivered',
      ref_id: order.id,
      ref_table: 'orders',
      title: `Order dikirim: ${order.order_number}`,
      description: `Akun di-deliver ke buyer · Modal Rp ${payload.cost_idr.toLocaleString('id-ID')}`,
      metadata: {
        order_number: order.order_number,
        cost_idr: payload.cost_idr,
        cost_source: payload.cost_source,
        total_idr: order.total_idr,
        profit_idr: order.total_idr - payload.cost_idr,
      },
    })

    return { ok: true, delivered: true, stock_id: stockRow.id }
  }

  static async updateStatus(orderId: string, status: string) {
    const supabase = createAdminClient()
    const { data: existing } = await supabase
      .from('orders')
      .select('order_number, total_idr')
      .eq('id', orderId)
      .maybeSingle()
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    if (status === 'refunded' && existing) {
      await ActivityLogService.log({
        event_type: 'order_refunded',
        ref_id: orderId,
        ref_table: 'orders',
        title: `Refund diproses: ${(existing as { order_number: string }).order_number}`,
        description: `Order di-refund · Total Rp ${(existing as { total_idr: number }).total_idr.toLocaleString('id-ID')}`,
        metadata: existing,
      })
    }
    return { ok: true }
  }

  /**
   * Admin manual mark order as confirmed (buyer lupa konfirmasi setelah delivered).
   */
  static async markConfirmed(orderId: string) {
    const supabase = createAdminClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, status, order_number')
      .eq('id', orderId)
      .maybeSingle()
    if (!order) throw new ApiError('NOT_FOUND', 'Pesanan tidak ditemukan', 404)
    if (order.status !== 'delivered') {
      throw new ApiError('VALIDATION_ERROR', `Order status '${order.status}' — hanya bisa confirm dari 'delivered'`, 400)
    }
    const { error } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', orderId)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true, order_number: (order as { order_number: string }).order_number }
  }

  /**
   * Resend notif yang sudah ada di notifications_log. Re-trigger sesuai
   * channel + template asli. Pakai untuk credential delivery yang gagal /
   * buyer minta resend.
   */
  static async resendNotification(orderId: string, notifId: string) {
    const supabase = createAdminClient()
    const { data: notif } = await supabase
      .from('notifications_log')
      .select('id, channel, template, user_id, order_id')
      .eq('id', notifId)
      .eq('order_id', orderId)
      .maybeSingle()
    if (!notif) throw new ApiError('NOT_FOUND', 'Notifikasi tidak ditemukan', 404)

    // Untuk credential delivery, paling akurat trigger ulang via PaymentService.notifyBuyerDelivered
    if (notif.template === 'account_delivered') {
      const { data: order } = await supabase
        .from('orders')
        .select('id, user_id, product_id, order_number, total_idr, status')
        .eq('id', orderId)
        .maybeSingle()
      if (!order) throw new ApiError('NOT_FOUND', 'Order tidak ditemukan', 404)
      await PaymentService.notifyBuyerDelivered(order as {
        id: string; user_id: string; product_id: string; order_number: string; total_idr: number; status: string
      })
      return { ok: true, resent: 'account_delivered' }
    }

    // Untuk template lain, mark notif lama jadi 'failed' supaya cron retry pick up
    await supabase.from('notifications_log').update({ status: 'failed' }).eq('id', notifId)
    return { ok: true, requeued: true }
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

    const result = await SupplierCanbosoService.purchase(product.supplier_product_id)

    await ActivityLogService.log({
      event_type: 'supplier_purchase',
      ref_id: order.id,
      ref_table: 'orders',
      title: `Beli ke supplier untuk order`,
      description: `${product.name}${result.cost_usd ? ` · $${result.cost_usd}` : ''}${result.cost_idr ? ` (Rp ${result.cost_idr.toLocaleString('id-ID')})` : ''}`,
      metadata: {
        order_id: order.id,
        supplier_product_id: product.supplier_product_id,
        cost_usd: result.cost_usd,
        cost_idr: result.cost_idr,
      },
    })

    return result
  }
}

export class AdminTicketsService {
  static async list(q: {
    status?: string
    reason?: string
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
    // Status filter: support 'resolved' shortcut untuk semua variants
    if (q.status === 'resolved') {
      query = query.like('status', 'resolved%')
    } else if (q.status) {
      query = query.eq('status', q.status)
    }
    if (q.reason) query = query.eq('reason', q.reason)
    if (q.search) {
      const safe = q.search.replace(/[%,()]/g, '')
      // Search di description ATAU order_number (via inner join filter)
      query = query.or(`description.ilike.%${safe}%,orders.order_number.ilike.%${safe}%`)
    }
    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    // Enrich dengan buyer info (FK user_id ke auth.users — fetch profiles separately)
    const tickets = (data ?? []) as Array<{ user_id: string; [k: string]: unknown }>
    const userIds = Array.from(new Set(tickets.map((t) => t.user_id).filter(Boolean)))
    const profileMap = new Map<string, { full_name: string | null; phone_wa: string | null }>()
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone_wa')
        .in('id', userIds)
      for (const p of (profiles ?? []) as Array<{ id: string; full_name: string | null; phone_wa: string | null }>) {
        profileMap.set(p.id, { full_name: p.full_name, phone_wa: p.phone_wa })
      }
    }
    const enriched = tickets.map((t) => ({ ...t, buyer: profileMap.get(t.user_id) ?? null }))

    // Metrics aggregate (independent dari filter) untuk subtitle
    const { count: openCount } = await supabase
      .from('support_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')
    const { count: inReviewCount } = await supabase
      .from('support_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_review')

    // SLA breach: open > 24 jam
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: slaBreachCount } = await supabase
      .from('support_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')
      .lt('created_at', twentyFourHoursAgo)

    return {
      tickets: enriched,
      pagination: { page: q.page, limit: q.limit, total: count ?? 0 },
      metrics: {
        open_count: openCount ?? 0,
        in_review_count: inReviewCount ?? 0,
        sla_breach_count: slaBreachCount ?? 0,
      },
    }
  }

  static async getOne(ticketId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('support_tickets')
      .select(
        `id, reason, description, screenshot_url, status, resolution, resolved_at, created_at, user_id,
         orders!inner ( id, order_number, product_id, total_idr, paid_at, delivered_at, status,
           products ( name, slug, thumbnail_url ) )`,
      )
      .eq('id', ticketId)
      .maybeSingle()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!data) throw new ApiError('NOT_FOUND', 'Tiket tidak ditemukan', 404)

    const orderRel = (data as { orders: Record<string, unknown> | Record<string, unknown>[] }).orders
    const order = Array.isArray(orderRel) ? orderRel[0] : orderRel
    const productRel = (order as { products: unknown }).products
    const product = Array.isArray(productRel) ? productRel[0] : productRel

    const userId = (data as { user_id: string }).user_id

    // Available stock (untuk replacement)
    const { data: availableStock } = await supabase
      .from('account_stock')
      .select('id, created_at')
      .eq('product_id', (order as { product_id: string }).product_id)
      .eq('is_used', false)
      .order('created_at')
      .limit(20)

    // Buyer info: email + profile
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_wa')
      .eq('id', userId)
      .maybeSingle()

    // Riwayat tiket buyer ini (selain tiket sekarang)
    const { data: previousTickets } = await supabase
      .from('support_tickets')
      .select('id, reason, status, created_at')
      .eq('user_id', userId)
      .neq('id', ticketId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Notifikasi log untuk order ini
    const { data: notifications } = await supabase
      .from('notifications_log')
      .select('id, channel, template, status, created_at')
      .eq('order_id', (order as { id: string }).id)
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      ...data,
      orders: undefined,
      order: {
        id: (order as { id: string }).id,
        order_number: (order as { order_number: string }).order_number,
        total_idr: (order as { total_idr: number }).total_idr,
        paid_at: (order as { paid_at: string | null }).paid_at,
        delivered_at: (order as { delivered_at: string | null }).delivered_at,
        status: (order as { status: string }).status,
        product,
      },
      buyer_email: authUser.user?.email ?? null,
      buyer: profile ?? null,
      previous_tickets: previousTickets ?? [],
      notifications: notifications ?? [],
      available_stock_ids: (availableStock ?? []).map((s: { id: string }) => s.id),
    }
  }

  /**
   * Update status tiket (mis. open → in_review) tanpa resolve.
   * Pakai untuk admin quick-action "Mark In Review".
   */
  static async updateStatus(ticketId: string, status: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', ticketId)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
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

    await ActivityLogService.log({
      event_type: 'ticket_resolved',
      ref_id: ticketId,
      ref_table: 'support_tickets',
      title: `Tiket di-resolve (${input.status})`,
      description: input.resolution.slice(0, 200),
      metadata: { status: input.status, admin_id: adminId },
    })

    // Notif buyer — kirim resolution + link dashboard. Kalau status "resolved" +
    // ada new_account_stock_id, trigger ulang notifyBuyerDelivered supaya
    // credential pengganti masuk WA/email juga.
    try {
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select('user_id, order_id, orders!inner(order_number)')
        .eq('id', ticketId)
        .maybeSingle()
      if (ticket?.user_id && ticket?.order_id) {
        const orderRel = (ticket as { orders?: { order_number: string } | { order_number: string }[] }).orders
        const orderObj = Array.isArray(orderRel) ? orderRel[0] : orderRel
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_wa')
          .eq('id', ticket.user_id)
          .maybeSingle()
        const { data: authUser } = await supabase.auth.admin.getUserById(ticket.user_id)
        const userEmail = authUser.user?.email
        const tpl = templates.ticketReplaced({
          fullName: profile?.full_name ?? 'Buyer',
          orderNumber: orderObj?.order_number ?? '',
          resolution: input.resolution,
        })
        if (profile?.phone_wa) {
          await NotificationService.sendWhatsApp({
            target: profile.phone_wa,
            message: tpl.waText,
            template: tpl.template,
            userId: ticket.user_id,
            orderId: ticket.order_id,
          })
        }
        if (userEmail) {
          await NotificationService.sendEmail({
            to: userEmail,
            subject: tpl.emailSubject,
            html: tpl.emailHtml,
            template: tpl.template,
            userId: ticket.user_id,
            orderId: ticket.order_id,
          })
        }

        // Kalau admin assign new_account_stock_id (akun pengganti),
        // trigger notifyBuyerDelivered untuk kirim credential pengganti juga.
        if (input.new_account_stock_id) {
          const { data: order } = await supabase
            .from('orders')
            .select('id, user_id, product_id, order_number, total_idr, status')
            .eq('id', ticket.order_id)
            .maybeSingle()
          if (order) {
            await PaymentService.notifyBuyerDelivered(order as {
              id: string; user_id: string; product_id: string; order_number: string; total_idr: number; status: string
            })
          }
        }
      }
    } catch (notifErr) {
      console.warn('[ticket/resolve] notify buyer failed (non-blocking):', notifErr)
    }

    return { ok: true }
  }
}

export class AdminCouponsService {
  static async list(q?: {
    status?: 'active' | 'inactive' | 'expired' | 'exhausted'
    search?: string
    page?: number
    limit?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }) {
    const supabase = createAdminClient()
    const page = q?.page ?? 1
    const limit = q?.limit ?? 50
    const offset = (page - 1) * limit
    const sortColumn = q?.sort_by ?? 'created_at'
    const sortAsc = q?.sort_dir === 'asc'

    let query = supabase
      .from('coupons')
      .select('*', { count: 'exact' })
      .order(sortColumn, { ascending: sortAsc })
      .range(offset, offset + limit - 1)

    if (q?.status === 'active') {
      query = query.eq('is_active', true)
    } else if (q?.status === 'inactive') {
      query = query.eq('is_active', false)
    } else if (q?.status === 'expired') {
      query = query.lt('expires_at', new Date().toISOString())
    }
    if (q?.search) {
      const safe = q.search.replace(/[%,()]/g, '')
      query = query.ilike('code', `%${safe}%`)
    }

    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    // Filter exhausted di JS (used_count >= max_uses) — Postgres comparison
    // antar 2 kolom dengan max_uses nullable agak ribet via PostgREST.
    let filtered = (data ?? []) as Array<{ used_count: number; max_uses: number | null }>
    if (q?.status === 'exhausted') {
      filtered = filtered.filter((r) => r.max_uses !== null && r.used_count >= r.max_uses)
    }

    // Aggregate metrics — total saving + total redemption (independent dari filter)
    const { data: metricsData } = await supabase
      .from('coupons')
      .select('used_count, is_active')
    const totalRedemption = (metricsData ?? []).reduce((s, r) => s + (r.used_count ?? 0), 0)
    const totalActive = (metricsData ?? []).filter((r) => r.is_active).length

    return {
      coupons: filtered,
      pagination: { page, limit, total: count ?? 0 },
      metrics: { total_redemption: totalRedemption, total_active: totalActive },
    }
  }

  static async getOne(id: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('coupons').select('*').eq('id', id).maybeSingle()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!data) throw new ApiError('NOT_FOUND', 'Kupon tidak ditemukan', 404)
    return data
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
    await ActivityLogService.log({
      event_type: 'coupon_created',
      ref_id: data.id,
      ref_table: 'coupons',
      title: `Kupon baru: ${data.code}`,
      description: `${data.discount_type === 'percent' ? data.discount_value + '%' : 'Rp ' + data.discount_value.toLocaleString('id-ID')} off`,
      metadata: { code: data.code, discount_type: data.discount_type, discount_value: data.discount_value },
    })
    return data
  }

  static async update(
    id: string,
    input: Partial<{
      discount_value: number
      max_uses: number | null
      expires_at: string | null
      is_active: boolean
      valid_for_products: string[] | null
    }>,
  ) {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('coupons').update(input).eq('id', id).select('*').single()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return data
  }

  /**
   * Analytics per-kupon: list order yang pakai kupon ini + aggregate metrics.
   * Pakai untuk page detail /admin/kupon/[id].
   */
  static async getAnalytics(id: string) {
    const supabase = createAdminClient()
    const { data: coupon, error: coupErr } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (coupErr) throw new ApiError('INTERNAL_ERROR', coupErr.message, 500)
    if (!coupon) throw new ApiError('NOT_FOUND', 'Kupon tidak ditemukan', 404)

    // Order list yang pakai kupon ini (filter by coupon_code, bukan by id —
    // historical orders simpan code, bukan id reference)
    const { data: orders } = await supabase
      .from('orders')
      .select(
        `id, order_number, total_idr, amount_idr, discount_idr, status, created_at,
         products!inner ( name, slug )`,
      )
      .eq('coupon_code', (coupon as { code: string }).code)
      .order('created_at', { ascending: false })
      .limit(100)

    const rows = (orders ?? []) as Array<{
      total_idr: number
      discount_idr: number
      status: string
    }>
    const totalDiscount = rows.reduce((s, r) => s + (r.discount_idr ?? 0), 0)
    const totalRevenue = rows.reduce((s, r) => s + (r.total_idr ?? 0), 0)
    const paidOrders = rows.filter((r) => ['paid', 'delivered', 'confirmed'].includes(r.status)).length
    const conversionRate = rows.length > 0 ? Math.round((paidOrders / rows.length) * 100) : 0

    return {
      coupon,
      orders: orders ?? [],
      metrics: {
        total_orders: rows.length,
        paid_orders: paidOrders,
        conversion_rate_pct: conversionRate,
        total_discount_given: totalDiscount,
        total_revenue: totalRevenue,
      },
    }
  }

  /**
   * Auto-deactivate kupon yang sudah lewat expires_at. Run by cron.
   * Return list kupon yang baru di-deactivate untuk activity log.
   */
  static async autoDeactivateExpired() {
    const supabase = createAdminClient()
    const now = new Date().toISOString()
    const { data: expired } = await supabase
      .from('coupons')
      .select('id, code')
      .eq('is_active', true)
      .not('expires_at', 'is', null)
      .lt('expires_at', now)
    const list = (expired ?? []) as { id: string; code: string }[]
    if (list.length === 0) return { deactivated: 0, items: [] }
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: false })
      .in('id', list.map((c) => c.id))
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { deactivated: list.length, items: list }
  }

  static async deactivate(id: string) {
    const supabase = createAdminClient()
    const { data: existing } = await supabase.from('coupons').select('code').eq('id', id).maybeSingle()
    const { error } = await supabase.from('coupons').update({ is_active: false }).eq('id', id)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (existing) {
      await ActivityLogService.log({
        event_type: 'coupon_deactivated',
        ref_id: id,
        ref_table: 'coupons',
        title: `Kupon di-deactivate: ${(existing as { code: string }).code}`,
        metadata: existing,
      })
    }
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

  /**
   * Action Center aggregate untuk dashboard — semua hal yang butuh admin
   * attention dengan breakdown by urgency (SLA). 1 endpoint untuk hindari
   * banyak roundtrip.
   */
  static async getActionCenter() {
    const supabase = createAdminClient()
    const now = Date.now()
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString()
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
    const fortyEightHoursAgo = new Date(now - 48 * 60 * 60 * 1000).toISOString()

    // Paid orders — perlu fulfill, breakdown by SLA
    const [paidTotal, paidBreach2h, paidBreach24h] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid').lt('paid_at', twoHoursAgo),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid').lt('paid_at', twentyFourHoursAgo),
    ])

    // Open tickets — breakdown by age
    const [ticketTotal, ticketBreach24h, ticketBreach48h] = await Promise.all([
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open').lt('created_at', twentyFourHoursAgo),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open').lt('created_at', fortyEightHoursAgo),
    ])

    // Stock breakdown
    const [stockOut, stockCritical] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true).eq('display_stock', 0),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true).gt('display_stock', 0).lte('display_stock', 5),
    ])

    return {
      paid_orders: {
        total: paidTotal.count ?? 0,
        sla_breach_2h: paidBreach2h.count ?? 0,
        sla_breach_24h: paidBreach24h.count ?? 0,
      },
      open_tickets: {
        total: ticketTotal.count ?? 0,
        sla_breach_24h: ticketBreach24h.count ?? 0,
        sla_breach_48h: ticketBreach48h.count ?? 0,
      },
      stock: {
        out: stockOut.count ?? 0,
        critical: stockCritical.count ?? 0,
      },
    }
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

  /**
   * Analytics overview — revenue + profit aggregate untuk periode + compare
   * dengan periode sebelumnya untuk growth %. Pakai untuk KPI card row di
   * /admin/analytics.
   */
  static async getAnalyticsOverview(days: number) {
    const supabase = createAdminClient()
    const now = Date.now()
    const sinceCurrent = new Date(now - days * 86400_000).toISOString()
    const sincePrevious = new Date(now - 2 * days * 86400_000).toISOString()

    const aggregate = async (fromIso: string, toIso?: string) => {
      let query = supabase
        .from('orders')
        .select('total_idr, cost_idr, status')
        .in('status', ['paid', 'delivered', 'confirmed'])
        .gte('created_at', fromIso)
      if (toIso) query = query.lt('created_at', toIso)
      const { data } = await query
      const rows = (data ?? []) as Array<{ total_idr: number; cost_idr: number | null; status: string }>
      const revenue = rows.reduce((s, r) => s + (r.total_idr ?? 0), 0)
      const orders = rows.length
      const withCost = rows.filter((r) => r.cost_idr !== null)
      const profit = withCost.reduce((s, r) => s + (r.total_idr - (r.cost_idr ?? 0)), 0)
      const revenueTracked = withCost.reduce((s, r) => s + r.total_idr, 0)
      const margin = revenueTracked > 0 ? Math.round((profit / revenueTracked) * 100) : 0
      return { revenue, orders, profit, margin, orders_tracked: withCost.length }
    }

    const [current, previous] = await Promise.all([
      aggregate(sinceCurrent),
      aggregate(sincePrevious, sinceCurrent),
    ])

    const growth = (a: number, b: number) => (b > 0 ? Math.round(((a - b) / b) * 100) : a > 0 ? 100 : 0)
    const aov = current.orders > 0 ? Math.round(current.revenue / current.orders) : 0
    const aovPrev = previous.orders > 0 ? Math.round(previous.revenue / previous.orders) : 0

    return {
      current,
      previous,
      growth: {
        revenue_pct: growth(current.revenue, previous.revenue),
        orders_pct: growth(current.orders, previous.orders),
        profit_pct: growth(current.profit, previous.profit),
        aov_pct: growth(aov, aovPrev),
      },
      aov,
      aov_prev: aovPrev,
    }
  }

  /**
   * Status breakdown — count order per status dalam periode. Pakai untuk
   * funnel visualization (pending → paid → delivered → confirmed).
   */
  static async getStatusBreakdown(days: number) {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 86400_000).toISOString()
    const { data } = await supabase
      .from('orders')
      .select('status')
      .gte('created_at', since)

    const counts: Record<string, number> = {
      pending_payment: 0, paid: 0, delivered: 0, confirmed: 0,
      refunded: 0, expired: 0, delivery_failed: 0,
    }
    for (const r of (data ?? []) as Array<{ status: string }>) {
      counts[r.status] = (counts[r.status] ?? 0) + 1
    }
    return counts
  }

  /**
   * Top produk by PROFIT (bukan revenue). Aggregate per produk: total
   * revenue, cost, profit, margin %. Filter delivered orders dengan cost_idr.
   * Untuk halaman analytics — beda kasus dengan top-products by sold_count.
   */
  static async getTopProductsByProfit(days: number, limit: number) {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 86400_000).toISOString()
    const { data } = await supabase
      .from('orders')
      .select('product_id, total_idr, cost_idr, products!inner(name, thumbnail_url)')
      .in('status', ['delivered', 'confirmed'])
      .not('cost_idr', 'is', null)
      .gte('created_at', since)

    const buckets = new Map<string, {
      id: string; name: string; thumbnail_url: string | null
      revenue: number; cost: number; profit: number; orders: number
    }>()
    for (const r of (data ?? []) as Array<{
      product_id: string; total_idr: number; cost_idr: number
      products: { name: string; thumbnail_url: string | null } | { name: string; thumbnail_url: string | null }[]
    }>) {
      const prodRel = Array.isArray(r.products) ? r.products[0] : r.products
      if (!prodRel) continue
      const cur = buckets.get(r.product_id) ?? {
        id: r.product_id, name: prodRel.name, thumbnail_url: prodRel.thumbnail_url,
        revenue: 0, cost: 0, profit: 0, orders: 0,
      }
      cur.revenue += r.total_idr
      cur.cost += r.cost_idr
      cur.profit += r.total_idr - r.cost_idr
      cur.orders += 1
      buckets.set(r.product_id, cur)
    }

    return Array.from(buckets.values())
      .map((b) => ({
        ...b,
        margin_pct: b.revenue > 0 ? Math.round((b.profit / b.revenue) * 100) : 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit)
  }

  /**
   * SLA performance — distribusi waktu fulfillment (paid_at → delivered_at)
   * untuk order delivered di periode. Pakai untuk monitor operasional admin.
   */
  static async getSLAMetrics(days: number) {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 86400_000).toISOString()
    const { data } = await supabase
      .from('orders')
      .select('paid_at, delivered_at')
      .in('status', ['delivered', 'confirmed'])
      .not('paid_at', 'is', null)
      .not('delivered_at', 'is', null)
      .gte('paid_at', since)

    const rows = (data ?? []) as Array<{ paid_at: string; delivered_at: string }>
    if (rows.length === 0) {
      return {
        total: 0, avg_minutes: 0, median_minutes: 0,
        buckets: { under_1h: 0, '1_to_6h': 0, '6_to_24h': 0, over_24h: 0 },
        bucket_pct: { under_1h: 0, '1_to_6h': 0, '6_to_24h': 0, over_24h: 0 },
      }
    }

    const durations = rows
      .map((r) => (new Date(r.delivered_at).getTime() - new Date(r.paid_at).getTime()) / 60_000)
      .filter((d) => d >= 0)
      .sort((a, b) => a - b)

    const total = durations.length
    const sum = durations.reduce((s, d) => s + d, 0)
    const avgMin = Math.round(sum / total)
    const medianMin = Math.round(durations[Math.floor(total / 2)] ?? 0)

    const buckets = {
      under_1h: durations.filter((d) => d < 60).length,
      '1_to_6h': durations.filter((d) => d >= 60 && d < 360).length,
      '6_to_24h': durations.filter((d) => d >= 360 && d < 1440).length,
      over_24h: durations.filter((d) => d >= 1440).length,
    }
    const bucket_pct = Object.fromEntries(
      Object.entries(buckets).map(([k, v]) => [k, Math.round((v / total) * 100)]),
    ) as { under_1h: number; '1_to_6h': number; '6_to_24h': number; over_24h: number }

    return { total, avg_minutes: avgMin, median_minutes: medianMin, buckets, bucket_pct }
  }

  /**
   * Notification health — success rate email + WA di periode. Pakai untuk
   * monitor reliability notif channel (mis. WAHA down).
   */
  static async getNotificationHealth(days: number) {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 86400_000).toISOString()
    const { data } = await supabase
      .from('notifications_log')
      .select('channel, status')
      .gte('created_at', since)

    const result: Record<string, { sent: number; failed: number; pending: number; total: number; success_pct: number }> = {
      email: { sent: 0, failed: 0, pending: 0, total: 0, success_pct: 0 },
      wa: { sent: 0, failed: 0, pending: 0, total: 0, success_pct: 0 },
    }
    for (const r of (data ?? []) as Array<{ channel: string; status: string }>) {
      const ch = result[r.channel] ?? (result[r.channel] = { sent: 0, failed: 0, pending: 0, total: 0, success_pct: 0 })
      ch.total += 1
      if (r.status === 'sent') ch.sent += 1
      else if (r.status === 'failed') ch.failed += 1
      else ch.pending += 1
    }
    for (const k of Object.keys(result)) {
      const ch = result[k]
      ch.success_pct = ch.total > 0 ? Math.round((ch.sent / ch.total) * 100) : 0
    }
    return result
  }

  /**
   * Revenue + orders breakdown per kategori produk untuk periode tertentu.
   * Pakai untuk chart "Per-Category Share" — lihat AI vs Kreator share.
   */
  static async getCategoryBreakdown(days: number) {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 86400_000).toISOString()
    const { data } = await supabase
      .from('orders')
      .select('total_idr, products!inner(category_id, categories!inner(name, slug))')
      .in('status', ['paid', 'delivered', 'confirmed'])
      .gte('created_at', since)

    const buckets = new Map<string, { name: string; slug: string; revenue: number; orders: number }>()
    for (const r of (data ?? []) as Array<{
      total_idr: number
      products: { category_id: string; categories: { name: string; slug: string } | { name: string; slug: string }[] } | { category_id: string; categories: { name: string; slug: string } | { name: string; slug: string }[] }[]
    }>) {
      const prodRel = Array.isArray(r.products) ? r.products[0] : r.products
      if (!prodRel) continue
      const catRel = Array.isArray(prodRel.categories) ? prodRel.categories[0] : prodRel.categories
      if (!catRel) continue
      const key = catRel.slug
      const cur = buckets.get(key) ?? { name: catRel.name, slug: catRel.slug, revenue: 0, orders: 0 }
      cur.revenue += r.total_idr ?? 0
      cur.orders += 1
      buckets.set(key, cur)
    }

    const totalRevenue = Array.from(buckets.values()).reduce((s, b) => s + b.revenue, 0)
    return Array.from(buckets.values())
      .map((b) => ({
        ...b,
        share_pct: totalRevenue > 0 ? Math.round((b.revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }

  /**
   * Profit trend harian — gabungan dengan revenue trend supaya 1 chart bisa
   * tampilkan dua line (revenue + profit).
   */
  static async getProfitTrend(days: number) {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 86400_000).toISOString()
    const { data } = await supabase
      .from('orders')
      .select('paid_at, total_idr, cost_idr')
      .in('status', ['paid', 'delivered', 'confirmed'])
      .gte('paid_at', since)
      .order('paid_at', { ascending: true })

    const buckets = new Map<string, { revenue: number; profit: number; orders: number }>()
    for (const r of (data ?? []) as Array<{ paid_at: string | null; total_idr: number; cost_idr: number | null }>) {
      if (!r.paid_at) continue
      const day = r.paid_at.slice(0, 10)
      const cur = buckets.get(day) ?? { revenue: 0, profit: 0, orders: 0 }
      cur.revenue += r.total_idr
      cur.profit += r.cost_idr !== null ? r.total_idr - r.cost_idr : 0
      cur.orders += 1
      buckets.set(day, cur)
    }
    return Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }))
  }
}

export class AdminUsersService {
  static async list(q: {
    role?: 'user' | 'admin'
    status?: 'active' | 'suspended' | 'banned'
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
    if (q.role) query = query.eq('role', q.role)
    if (q.status) query = query.eq('status', q.status)
    if (q.search) query = query.or(`full_name.ilike.%${q.search}%,phone_wa.ilike.%${q.search}%`)
    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    // Aggregate metrics (independent dari filter) — pakai untuk subtitle
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user')
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: newThisWeek } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('joined_at', oneWeekAgo)
    const { count: suspended } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user')
      .in('status', ['suspended', 'banned'])

    return {
      users: data ?? [],
      pagination: { page: q.page, limit: q.limit, total: count ?? 0 },
      metrics: {
        total_users: totalUsers ?? 0,
        new_this_week: newThisWeek ?? 0,
        suspended_count: suspended ?? 0,
      },
    }
  }

  static async setStatus(userId: string, status: 'active' | 'suspended' | 'banned') {
    const supabase = createAdminClient()
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
  }

  /**
   * Get user detail untuk page /admin/pengguna/[id].
   * Include: profile, email (dari auth.users), stats (total order, total
   * spent, referral count), recent orders.
   */
  static async getOne(userId: string) {
    const supabase = createAdminClient()
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('id, full_name, phone_wa, role, status, credits, joined_at, referral_code')
      .eq('id', userId)
      .maybeSingle()
    if (profErr) throw new ApiError('INTERNAL_ERROR', profErr.message, 500)
    if (!profile) throw new ApiError('NOT_FOUND', 'User tidak ditemukan', 404)

    // Cari referrer_user_id dari referrals table (kalau ada), lalu fetch
    // profile referrer-nya separately. FK referrals.referrer_user_id ke
    // auth.users (bukan profiles), jadi gak bisa embed langsung.
    const { data: referredByRow } = await supabase
      .from('referrals')
      .select('referrer_user_id')
      .eq('referred_user_id', userId)
      .maybeSingle()
    const referrerUserId = (referredByRow as { referrer_user_id: string } | null)?.referrer_user_id ?? null
    type RefProfile = { full_name: string | null; referral_code: string }
    let referrerProfile: RefProfile | null = null
    if (referrerUserId) {
      const { data: rp } = await supabase
        .from('profiles')
        .select('full_name, referral_code')
        .eq('id', referrerUserId)
        .maybeSingle()
      referrerProfile = (rp as RefProfile | null) ?? null
    }

    // Email dari auth.users
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    const email = authUser.user?.email ?? null
    const lastSignIn = authUser.user?.last_sign_in_at ?? null

    // Order stats
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, order_number, total_idr, status, created_at, products!inner(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    const orders = (ordersData ?? []) as Array<{
      id: string
      order_number: string
      total_idr: number
      status: string
      created_at: string
      products: { name: string } | { name: string }[]
    }>

    const paidOrders = orders.filter((o) => ['paid', 'delivered', 'confirmed'].includes(o.status))
    const totalSpent = paidOrders.reduce((s, o) => s + (o.total_idr ?? 0), 0)

    // Referral count
    const { count: referralCount } = await supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_user_id', userId)
      .eq('status', 'credited')

    return {
      ...profile,
      email,
      last_sign_in_at: lastSignIn,
      referred_by: referrerProfile
        ? `${referrerProfile.full_name ?? '—'} (${referrerProfile.referral_code})`
        : null,
      stats: {
        total_orders: orders.length,
        paid_orders: paidOrders.length,
        total_spent: totalSpent,
        referral_count: referralCount ?? 0,
      },
      recent_orders: orders,
    }
  }

  /**
   * Timeline aktivitas user — gabungan dari:
   *   - admin_activity_log dengan ref_id=userId (user_registered)
   *   - admin_activity_log dengan metadata.user_id=userId (semua event yang
   *     reference user ini: order_created, order_paid, ticket_created, dll)
   *   - orders milik user (history pesanan ringkas)
   * Return sorted chronological desc, limit 50.
   */
  static async getUserTimeline(userId: string) {
    const supabase = createAdminClient()

    // Activity log: gabungkan 2 query (ref_id=userId DAN metadata->user_id=userId)
    const { data: directEvents } = await supabase
      .from('admin_activity_log')
      .select('id, event_type, ref_id, ref_table, title, description, metadata, created_at')
      .eq('ref_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: relatedEvents } = await supabase
      .from('admin_activity_log')
      .select('id, event_type, ref_id, ref_table, title, description, metadata, created_at')
      .contains('metadata', { user_id: userId })
      .order('created_at', { ascending: false })
      .limit(50)

    // Merge + dedup by id
    const eventMap = new Map<string, Record<string, unknown>>()
    for (const e of (directEvents ?? []) as Array<{ id: string }>) eventMap.set(e.id, e)
    for (const e of (relatedEvents ?? []) as Array<{ id: string }>) eventMap.set(e.id, e)
    const events = Array.from(eventMap.values()).sort((a, b) => {
      const aTime = new Date((a as { created_at: string }).created_at).getTime()
      const bTime = new Date((b as { created_at: string }).created_at).getTime()
      return bTime - aTime
    })

    return events.slice(0, 50)
  }

  /**
   * Adjust kredit user secara manual. Positif untuk add, negatif untuk
   * deduct. Activity log untuk audit trail.
   */
  static async adjustCredits(userId: string, amount: number, reason?: string) {
    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, full_name')
      .eq('id', userId)
      .maybeSingle()
    if (!profile) throw new ApiError('NOT_FOUND', 'User tidak ditemukan', 404)
    const currentCredits = (profile as { credits: number }).credits ?? 0
    const newCredits = Math.max(0, currentCredits + amount)
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    // Reason untuk audit trail (di-log untuk Cloudflare Logs — kalau perlu
    // simpan permanen, bisa pakai table credit_adjustments di future)
    if (reason) console.info('[admin/credits] adjust', { userId, amount, reason })
    return { ok: true, previous: currentCredits, current: newCredits, delta: newCredits - currentCredits }
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
