import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jualakun.id'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/tentang`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/kontak`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/syarat-ketentuan`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/kebijakan-privasi`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/kebijakan-garansi`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return staticEntries

  const supabase = createClient(url, anonKey)

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p: { slug: string; updated_at?: string }) => ({
    url: `${SITE_URL}/produk/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...productEntries]
}
