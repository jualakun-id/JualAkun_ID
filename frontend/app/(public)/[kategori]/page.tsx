import { notFound } from 'next/navigation'
import { ProductCard, ProductCardGrid } from '@/components/product-card'
import { serverFetch } from '@/lib/server-fetch'
import type { Product, Category } from '@/types'

type CatalogResponse = {
  products: (Product & { category?: { name: string; slug: string } })[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}

type Props = {
  params: Promise<{ kategori: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}

export const revalidate = 180

export default async function KategoriPage({ params, searchParams }: Props) {
  const { kategori } = await params
  const sp = await searchParams
  const sort = sp.sort ?? 'sold_count'
  const page = Number(sp.page ?? 1)

  const [categories, listing] = await Promise.all([
    serverFetch<(Category & { product_count: number })[]>('/catalog/categories', { revalidate: 600 }),
    serverFetch<CatalogResponse>(
      `/catalog?category_slug=${encodeURIComponent(kategori)}&sort=${sort}&page=${page}&limit=20`,
      { revalidate: 180 },
    ),
  ])

  const cat = categories?.find((c) => c.slug === kategori)
  if (!cat) notFound()

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1">{cat.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {listing?.pagination.total ?? 0} produk di kategori ini
          </p>
        </div>
        <SortLinks current={sort} kategori={kategori} />
      </div>

      <div className="mt-8">
        {listing?.products?.length ? (
          <ProductCardGrid>
            {listing.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductCardGrid>
        ) : (
          <p className="text-text-muted">Belum ada produk di kategori ini.</p>
        )}
      </div>

      {listing && listing.pagination.total_pages > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: listing.pagination.total_pages }, (_, i) => i + 1).map((n) => (
            <a
              key={n}
              href={`?page=${n}&sort=${sort}`}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                n === page
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-surface text-text-muted hover:text-text'
              }`}
            >
              {n}
            </a>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function SortLinks({ current, kategori }: { current: string; kategori: string }) {
  const opts = [
    { v: 'sold_count', l: 'Terlaris' },
    { v: 'price_asc', l: 'Termurah' },
    { v: 'price_desc', l: 'Termahal' },
    { v: 'newest', l: 'Terbaru' },
  ]
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {opts.map((o) => (
        <a
          key={o.v}
          href={`/${kategori}?sort=${o.v}`}
          className={`rounded-md border px-3 py-1.5 ${
            current === o.v
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border bg-surface text-text-muted hover:text-text'
          }`}
        >
          {o.l}
        </a>
      ))}
    </div>
  )
}
