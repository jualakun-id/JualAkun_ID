import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

type CatalogQuery = {
  category_slug?: string
  min_price?: number
  max_price?: number
  duration_days?: number
  sort?: 'sold_count' | 'price_asc' | 'price_desc' | 'newest'
  page: number
  limit: number
}

export class CatalogService {
  static async list(q: CatalogQuery) {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('get_catalog_listing', {
      p_category_slug: q.category_slug ?? null,
      p_min_price: q.min_price ?? null,
      p_max_price: q.max_price ?? null,
      p_duration_days: q.duration_days ?? null,
      p_sort: q.sort ?? 'sold_count',
      p_page: q.page,
      p_limit: q.limit,
    })
    if (error) throw new ApiError('INTERNAL_ERROR', `catalog rpc: ${error.message}`, 500)
    return data
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
        `id, name, slug, description, thumbnail_url, price, duration_days, guarantee_days,
         stock_count, sold_count, rating_avg, rating_count, is_active,
         categories ( name, slug )`,
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!product) throw new ApiError('NOT_FOUND', 'Produk tidak ditemukan', 404)

    const { data: reviews } = await supabase
      .from('product_reviews')
      .select('id, rating, comment, created_at')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const cat = product.categories as { name: string; slug: string } | { name: string; slug: string }[] | null
    const category = Array.isArray(cat) ? cat[0] : cat

    return { ...product, categories: undefined, category, reviews: reviews ?? [] }
  }
}
