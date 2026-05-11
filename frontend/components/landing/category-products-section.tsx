'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Package } from 'lucide-react'
import { LandingProductCard } from './landing-product-card'
import type { Product } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'
const PAGE_SIZE = 8

type ProductWithCategory = Product & { category?: { name: string; slug: string } }

type CatalogResponse = {
  products: ProductWithCategory[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}

type SortValue = 'sold_count' | 'price_asc' | 'price_desc' | 'newest'

const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: 'sold_count', label: 'Terlaris' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Termurah' },
  { value: 'price_desc', label: 'Termahal' },
]

type Props = {
  slug: string
  label: string
  desc: string
  /** Initial data dari server (page 1, sort=sold_count, limit=8) — untuk SSR + SEO */
  initialData: CatalogResponse | null
  bgAlt: boolean
}

export function CategoryProductsSection({ slug, label, desc, initialData, bgAlt }: Props) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialData?.products ?? [])
  const [pagination, setPagination] = useState(
    initialData?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, total_pages: 0 },
  )
  const [sort, setSort] = useState<SortValue>('sold_count')
  const [loading, setLoading] = useState(false)

  async function fetchPage(nextPage: number, nextSort: SortValue) {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        category_slug: slug,
        sort: nextSort,
        page: String(nextPage),
        limit: String(PAGE_SIZE),
      })
      const res = await fetch(`${API_URL}/catalog?${params.toString()}`, { cache: 'no-store' })
      const json = (await res.json()) as { data: CatalogResponse }
      if (json.data) {
        setProducts(json.data.products)
        setPagination(json.data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSortChange(newSort: SortValue) {
    if (newSort === sort) return
    setSort(newSort)
    fetchPage(1, newSort) // reset ke page 1 saat ganti sort
  }

  const totalPages = Math.max(1, pagination.total_pages || Math.ceil(pagination.total / PAGE_SIZE) || 1)
  const hasPrev = pagination.page > 1
  const hasNext = pagination.page < totalPages

  return (
    <section
      id={slug}
      className={`scroll-mt-24 py-16 md:py-20 ${bgAlt ? 'bg-brand-50' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
            {label}
          </h2>
          <p className="text-ink-muted text-base md:text-lg font-medium mt-4 max-w-xl mx-auto">
            {desc}
          </p>
        </div>

        {/* Filter pills */}
        {pagination.total > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSortChange(opt.value)}
                  disabled={loading}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-extrabold transition-all duration-150 disabled:opacity-50 ${
                    active
                      ? 'border-black bg-brand-500 text-ink shadow-[0_3px_0_rgba(0,0,0,0.9)]'
                      : 'border-black bg-white text-ink hover:bg-brand-50 hover:-translate-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:shadow-[0_3px_0_rgba(0,0,0,0.9)]'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        ) : null}

        {/* Grid */}
        {products.length > 0 ? (
          <div className={`relative ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <LandingProductCard key={p.id} product={p} />
              ))}
            </div>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Loader2 size={32} strokeWidth={2} className="animate-spin text-brand-600" />
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className={`text-center py-12 rounded-2xl border-2 border-dashed border-black/20 ${
              bgAlt ? 'bg-white/50' : 'bg-brand-50/50'
            }`}
          >
            <Package className="w-10 h-10 mx-auto text-ink-subtle/40 mb-2" aria-hidden="true" />
            <p className="text-ink-muted text-base font-medium">
              Belum ada produk di kategori {label}.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 ? (
          <nav
            aria-label={`Pagination ${label}`}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <p className="text-sm font-medium text-ink-muted tabular-nums">
              Halaman <strong className="text-ink">{pagination.page}</strong> dari{' '}
              <strong className="text-ink">{totalPages}</strong> ·{' '}
              <strong className="text-ink">{pagination.total}</strong> produk total
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchPage(pagination.page - 1, sort)}
                disabled={!hasPrev || loading}
                className="inline-flex items-center gap-1 bg-white hover:bg-brand-50 text-ink font-extrabold px-4 py-2 rounded-lg border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
                Prev
              </button>
              <button
                type="button"
                onClick={() => fetchPage(pagination.page + 1, sort)}
                disabled={!hasNext || loading}
                className="inline-flex items-center gap-1 bg-white hover:bg-brand-50 text-ink font-extrabold px-4 py-2 rounded-lg border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </nav>
        ) : null}
      </div>
    </section>
  )
}
