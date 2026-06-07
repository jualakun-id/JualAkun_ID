'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Loader2, Package, Search, X } from 'lucide-react'
import { LandingProductCard } from './landing-product-card'
import type { Product } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'
const PAGE_SIZE = 16

type ProductWithCategory = Product & { category?: { name: string; slug: string } }

type CatalogResponse = {
  products: ProductWithCategory[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}

type SortValue = 'stock' | 'price_asc' | 'price_desc' | 'newest'

const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: 'stock', label: 'Tersedia' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Termurah' },
  { value: 'price_desc', label: 'Termahal' },
]

type CategoryOption = {
  slug: string
  name: string
}

type Props = {
  /** Daftar kategori untuk dropdown — server-fetched */
  categories: CategoryOption[]
  /** Initial data (page 1, all categories, sort=stock) untuk SSR + SEO */
  initialData: CatalogResponse | null
}

export function ProductBrowserSection({ categories, initialData }: Props) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialData?.products ?? [])
  const [pagination, setPagination] = useState(
    initialData?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, total_pages: 0 },
  )
  const [sort, setSort] = useState<SortValue>('stock')
  const [categorySlug, setCategorySlug] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Auto-filter berdasarkan hash URL (#ai → kategori ai) untuk backward compat
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && hash !== 'produk' && categories.some((c) => c.slug === hash)) {
      setCategorySlug(hash)
      fetchPage(1, sort, hash, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchPage(
    nextPage: number,
    nextSort: SortValue,
    nextCategory: string,
    nextSearch: string,
    append: boolean = false,
  ) {
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const params = new URLSearchParams({
        sort: nextSort,
        page: String(nextPage),
        limit: String(PAGE_SIZE),
      })
      if (nextCategory) params.set('category_slug', nextCategory)
      if (nextSearch.trim()) params.set('search', nextSearch.trim())
      const res = await fetch(`${API_URL}/catalog?${params.toString()}`, { cache: 'no-store' })
      const json = (await res.json()) as { data: CatalogResponse }
      if (json.data) {
        if (append) {
          setProducts((prev) => [...prev, ...json.data.products])
        } else {
          setProducts(json.data.products)
        }
        setPagination(json.data.pagination)
      }
    } finally {
      if (append) setLoadingMore(false)
      else setLoading(false)
    }
  }

  // Infinite scroll: auto-load page berikutnya saat sentinel mendekati viewport.
  // Pakai rootMargin 400px supaya prefetch dimulai sebelum user reach bottom,
  // biar UX flowing — gak ada jeda "kosong" saat tunggu fetch.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const hasMore = pagination.page < pagination.total_pages
    if (!hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading && !loadingMore) {
          fetchPage(pagination.page + 1, sort, categorySlug, search, true)
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.total_pages, loading, loadingMore, sort, categorySlug, search])

  function handleSortChange(newSort: SortValue) {
    if (newSort === sort) return
    setSort(newSort)
    fetchPage(1, newSort, categorySlug, search)
  }

  function handleCategoryChange(newSlug: string) {
    if (newSlug === categorySlug) return
    setCategorySlug(newSlug)
    fetchPage(1, sort, newSlug, search)
  }

  // Debounced search: trigger fetch 400ms after user berhenti ngetik
  function handleSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchPage(1, sort, categorySlug, value)
    }, 400)
  }

  function handleClearSearch() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSearch('')
    fetchPage(1, sort, categorySlug, '')
  }

  const hasMore = pagination.page < pagination.total_pages
  const activeCategoryLabel =
    categories.find((c) => c.slug === categorySlug)?.name ?? 'Semua Kategori'

  return (
    <section id="produk" className="scroll-mt-24 py-16 md:py-20 bg-brand-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
            Katalog Produk
          </h2>
          <p className="text-ink-muted text-base md:text-lg font-medium mt-4 max-w-xl mx-auto">
            Filter berdasarkan kategori atau urutkan sesuai preferensi kamu — semua premium, asli, dan kirim instan.
          </p>
        </div>

        {/* Filter row: Category dropdown + Search bar + Sort pills */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Category dropdown */}
          <div className="relative w-full max-w-xs shrink-0">
            <label htmlFor="category-filter" className="sr-only">
              Pilih kategori
            </label>
            <select
              id="category-filter"
              value={categorySlug}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={loading}
              className="appearance-none w-full rounded-lg border-2 border-black bg-white pl-4 pr-10 py-2.5 text-sm font-extrabold text-ink shadow-[0_3px_0_rgba(0,0,0,0.9)] focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer disabled:opacity-50"
            >
              <option value="">📋 Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              strokeWidth={2.5}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink"
              aria-hidden="true"
            />
          </div>

          {/* Search bar — di tengah, antara kategori dan sort pills */}
          <div className="relative flex-1 max-w-md mx-0 lg:mx-4">
            <label htmlFor="product-search" className="sr-only">
              Cari produk
            </label>
            <Search
              size={16}
              strokeWidth={2.25}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
              aria-hidden="true"
            />
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={loading}
              placeholder="Cari produk... (mis. claude, adobe)"
              className="w-full rounded-lg border-2 border-black bg-white pl-10 pr-9 py-2.5 text-sm font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal shadow-[0_2px_0_rgba(0,0,0,0.9)] focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50"
            />
            {search ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted hover:bg-gray-100 hover:text-ink"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            ) : null}
          </div>

          {/* Sort pills */}
          <div
            role="radiogroup"
            aria-label="Urutkan produk"
            className="flex flex-wrap items-center gap-2 shrink-0"
          >
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleSortChange(opt.value)}
                  disabled={loading}
                  className={`rounded-lg border-2 px-3.5 py-2 text-sm font-extrabold transition-all duration-150 disabled:opacity-50 ${
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
        </div>

        {/* Active filter summary (kalau kategori dipilih) */}
        {categorySlug ? (
          <p className="mb-4 text-sm text-ink-muted font-medium">
            Menampilkan kategori{' '}
            <strong className="text-ink">{activeCategoryLabel}</strong> ·{' '}
            <button
              type="button"
              onClick={() => handleCategoryChange('')}
              disabled={loading}
              className="text-brand-700 hover:text-brand-800 underline underline-offset-2 font-bold disabled:opacity-50"
            >
              Lihat semua
            </button>
          </p>
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
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-black/20 bg-white/50">
            <Package className="w-10 h-10 mx-auto text-ink-subtle/40 mb-2" aria-hidden="true" />
            <p className="text-ink-muted text-base font-medium">
              {categorySlug
                ? `Belum ada produk di kategori ${activeCategoryLabel}.`
                : 'Belum ada produk tersedia.'}
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel + status */}
        {products.length > 0 ? (
          <div
            ref={sentinelRef}
            aria-live="polite"
            className="mt-10 flex flex-col items-center justify-center gap-2 py-4"
          >
            {loadingMore ? (
              <span className="inline-flex items-center gap-2 text-sm font-bold text-ink-muted">
                <Loader2 size={16} strokeWidth={2.5} className="animate-spin text-brand-600" />
                Memuat lebih banyak…
              </span>
            ) : !hasMore && pagination.total > 0 ? (
              <span className="text-xs font-medium text-ink-subtle tabular-nums">
                Menampilkan <strong className="text-ink">{products.length}</strong> dari{' '}
                <strong className="text-ink">{pagination.total}</strong> produk · sudah semua
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
