import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

type CatalogQuery = {
  category_slug?: string
  min_price?: number
  max_price?: number
  duration_days?: number
  search?: string
  sort?: 'sold_count' | 'price_asc' | 'price_desc' | 'newest'
  page: number
  limit: number
}

export class CatalogService {
  /**
   * Direct Supabase query (sebelumnya pakai RPC get_catalog_listing).
   * Switch ke direct query supaya gampang extend dgn search param tanpa
   * butuh migration RPC. Performance setara karena Postgres tetap optimize
   * sama-sama via planner.
   */
  static async list(q: CatalogQuery) {
    const supabase = createAdminClient()
    const offset = (q.page - 1) * q.limit

    // Sort mapping
    const sortColumn =
      q.sort === 'price_asc' || q.sort === 'price_desc'
        ? 'price'
        : q.sort === 'newest'
          ? 'created_at'
          : 'sold_count'
    const sortAsc = q.sort === 'price_asc'

    let query = supabase
      .from('products')
      .select(
        `id, name, slug, thumbnail_url, price, original_price,
         discount_starts_at, discount_ends_at,
         duration_days, guarantee_days, display_stock, sold_count,
         rating_avg, rating_count,
         categories!inner ( name, slug )`,
        { count: 'exact' },
      )
      .eq('is_active', true)
      .order(sortColumn, { ascending: sortAsc, nullsFirst: false })
      .range(offset, offset + q.limit - 1)

    if (q.category_slug) query = query.eq('categories.slug', q.category_slug)
    if (q.min_price !== undefined) query = query.gte('price', q.min_price)
    if (q.max_price !== undefined) query = query.lte('price', q.max_price)
    if (q.duration_days !== undefined) query = query.eq('duration_days', q.duration_days)
    if (q.search) {
      // ILIKE search di name OR slug — escape karakter spesial PostgREST
      const safe = q.search.replace(/[%,()]/g, '')
      query = query.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`)
    }

    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', `catalog list: ${error.message}`, 500)

    // Normalize categories + alias display_stock → stock_count untuk backward
    // compat dengan frontend Product type yang masih pakai field 'stock_count'.
    const products = (data ?? []).map((p) => {
      const cats = (p as { categories: { name: string; slug: string } | { name: string; slug: string }[] }).categories
      const category = Array.isArray(cats) ? cats[0] : cats
      const { display_stock, ...rest } = p as Record<string, unknown> & { display_stock: number }
      return { ...rest, stock_count: display_stock, category }
    })

    const total = count ?? 0
    return {
      products,
      pagination: {
        page: q.page,
        limit: q.limit,
        total,
        total_pages: Math.max(1, Math.ceil(total / q.limit)),
      },
    }
  }

  static async listCategories() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon_url, sort_order, products(count)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (error) throw new ApiError('INTERNAL_ERROR', `categories: ${error.message}`, 500)

    return (data ?? []).map((row: { id: string; name: string; slug: string; icon_url: string | null; products: { count: number }[] }) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon_url: row.icon_url,
      product_count: row.products?.[0]?.count ?? 0,
    }))
  }

  static async getBySlug(slug: string) {
    const supabase = createAdminClient()
    const { data: product, error } = await supabase
      .from('products')
      .select(
        `id, name, slug, description, thumbnail_url, price, original_price,
         discount_starts_at, discount_ends_at,
         duration_days, guarantee_days,
         display_stock, sold_count, rating_avg, rating_count, is_active,
         categories ( name, slug )`,
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!product) throw new ApiError('NOT_FOUND', 'Produk tidak ditemukan', 404)

    // 5 ulasan terakhir, sorted desc by created_at — di tampilkan menyamping
    // (horizontal scroll) di halaman product detail
    const { data: reviews } = await supabase
      .from('product_reviews')
      .select('id, rating, comment, created_at')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const cat = product.categories as { name: string; slug: string } | { name: string; slug: string }[] | null
    const category = Array.isArray(cat) ? cat[0] : cat

    // Alias display_stock → stock_count untuk konsistensi frontend.
    const { display_stock, ...rest } = product as Record<string, unknown> & { display_stock: number }
    return { ...rest, stock_count: display_stock, categories: undefined, category, reviews: reviews ?? [] }
  }
}
