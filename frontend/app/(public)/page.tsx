import Link from 'next/link'
import { Zap, Shield, Headphones } from 'lucide-react'
import { ProductCard, ProductCardGrid } from '@/components/product-card'
import { serverFetch } from '@/lib/server-fetch'
import type { Product, Category } from '@/types'

type CatalogResponse = {
  products: (Product & { category?: { name: string; slug: string } })[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}

export const revalidate = 300

export default async function HomePage() {
  const [popular, categories] = await Promise.all([
    serverFetch<CatalogResponse>('/catalog?sort=sold_count&limit=10', { revalidate: 300 }),
    serverFetch<(Category & { product_count: number })[]>('/catalog/categories', { revalidate: 600 }),
  ])

  return (
    <>
      <section className="relative overflow-hidden border-b border-border-subtle">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="font-heading text-hero">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Akun Digital.</span>
              <br />
              Murah. <span className="text-accent">Langsung Aktif.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-text-muted">
              Marketplace akun digital terpercaya di Indonesia — Netflix, Spotify, ChatGPT, Canva, dan
              ratusan produk lainnya. Pengiriman instan via dashboard, garansi resmi.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/streaming"
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover"
              >
                Lihat Produk
              </Link>
              <Link
                href="/faq"
                className="rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-text hover:border-primary hover:text-primary"
              >
                Cara Kerja
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Feature icon={<Zap size={20} strokeWidth={1.5} />} title="Instan" desc="Akun terkirim < 5 menit" />
              <Feature icon={<Shield size={20} strokeWidth={1.5} />} title="Garansi" desc="Dijamin penggantian / refund" />
              <Feature icon={<Headphones size={20} strokeWidth={1.5} />} title="Support 24/7" desc="WhatsApp & email" />
            </div>
          </div>
        </div>
      </section>

      {categories && categories.length > 0 ? (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-h2">Kategori</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="rounded-xl border border-border bg-surface p-5 text-center hover:border-primary/50 hover:shadow-glow-sm"
              >
                <div className="font-heading text-h4 text-text">{c.name}</div>
                <div className="mt-1 text-xs text-text-subtle">{c.product_count} produk</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-h2">Produk Terlaris</h2>
          <Link href="/streaming" className="text-sm text-primary hover:text-primary-light">
            Lihat semua →
          </Link>
        </div>
        <div className="mt-6">
          {popular?.products?.length ? (
            <ProductCardGrid>
              {popular.products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 5} />
              ))}
            </ProductCardGrid>
          ) : (
            <p className="text-text-muted">Belum ada produk. Jalankan <code>supabase/seed.sql</code>.</p>
          )}
        </div>
      </section>
    </>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface/50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
        {icon}
      </div>
      <div>
        <div className="font-heading text-h4 text-text">{title}</div>
        <div className="text-sm text-text-muted">{desc}</div>
      </div>
    </div>
  )
}
