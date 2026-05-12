import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { Pagination } from '@/components/admin/pagination'
import { StockMonitorTableClient } from './stock-monitor-table-client'
import { SupplierSyncButton } from './supplier-sync-button'
import { WalletBalance } from './wallet-balance'
import { OrphanBanner } from './orphan-banner'
import { adminFetch } from '@/lib/admin-fetch'
import type { Category } from '@/types'

type Orphan = {
  product_id: string
  product_name: string
  supplier_product_id: string
  first_orphan_at: string
}

type StockRow = {
  id: string
  name: string
  slug: string
  price: number
  duration_days: number
  stock_count: number
  display_stock: number
  sold_count: number
  is_active: boolean
  thumbnail_url: string | null
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null
}

type ListResponse = {
  products: StockRow[]
  pagination: { page: number; limit: number; total: number }
}

type CountsResponse = { out: number; critical: number }

type Props = {
  searchParams: Promise<{
    filter?: string
    category?: string
    search?: string
    page?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }>
}

export const metadata = { title: 'Admin — Stok Monitor' }

export default async function AdminStokMonitorPage({ searchParams }: Props) {
  const sp = await searchParams
  const filter = (sp.filter ?? 'all') as 'all' | 'critical' | 'out'
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const params = new URLSearchParams()
  params.set('filter', filter)
  if (sp.category) params.set('category_slug', sp.category)
  if (sp.search) params.set('search', sp.search)
  params.set('page', String(page))
  params.set('limit', '10')
  if (sp.sort_by) params.set('sort_by', sp.sort_by)
  if (sp.sort_dir) params.set('sort_dir', sp.sort_dir)

  const countsParams = new URLSearchParams()
  if (sp.category) countsParams.set('category_slug', sp.category)

  const [data, counts, categories, orphans] = await Promise.all([
    adminFetch<ListResponse>(`/admin/stock-monitor?${params.toString()}`),
    adminFetch<CountsResponse>(`/admin/stock-monitor/counts${countsParams.toString() ? `?${countsParams.toString()}` : ''}`),
    adminFetch<Category[]>('/catalog/categories'),
    adminFetch<Orphan[]>('/admin/supplier/orphans'),
  ])

  // Pagination basePath: preserve semua filter + sort, drop page
  const pagBaseParams = new URLSearchParams()
  if (sp.filter) pagBaseParams.set('filter', sp.filter)
  if (sp.category) pagBaseParams.set('category', sp.category)
  if (sp.search) pagBaseParams.set('search', sp.search)
  if (sp.sort_by) pagBaseParams.set('sort_by', sp.sort_by)
  if (sp.sort_dir) pagBaseParams.set('sort_dir', sp.sort_dir)
  const basePath = `/admin/stok-monitor${pagBaseParams.toString() ? `?${pagBaseParams.toString()}` : ''}`

  // SortBasePath: preserve filter + category + search, drop page + sort
  const sortBaseParams = new URLSearchParams()
  if (sp.filter) sortBaseParams.set('filter', sp.filter)
  if (sp.category) sortBaseParams.set('category', sp.category)
  if (sp.search) sortBaseParams.set('search', sp.search)
  const sortBasePath = `/admin/stok-monitor${sortBaseParams.toString() ? `?${sortBaseParams.toString()}` : ''}`

  const rowOffset = ((data?.pagination.page ?? 1) - 1) * (data?.pagination.limit ?? 0)
  const out = counts?.out ?? 0
  const critical = counts?.critical ?? 0

  // Build filter pills hrefs — preserve category + search + sort tapi reset page
  const buildFilterHref = (val: 'all' | 'critical' | 'out') => {
    const p = new URLSearchParams()
    if (val !== 'all') p.set('filter', val)
    if (sp.category) p.set('category', sp.category)
    if (sp.search) p.set('search', sp.search)
    if (sp.sort_by) p.set('sort_by', sp.sort_by)
    if (sp.sort_dir) p.set('sort_dir', sp.sort_dir)
    return `/admin/stok-monitor${p.toString() ? `?${p.toString()}` : ''}`
  }

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title="Stok Monitor"
        subtitle={`${out} habis · ${critical} kritis · ${data?.pagination.total ?? 0} produk`}
        rightSlot={
          <div className="flex flex-wrap items-center gap-3">
            <WalletBalance />
            <SupplierSyncButton />
          </div>
        }
      />

      <OrphanBanner orphans={orphans ?? []} />

      <FilterBar
        activeValue={filter}
        pills={[
          { label: 'Semua', value: 'all', href: buildFilterHref('all') },
          { label: 'Kritis (1–5)', value: 'critical', href: buildFilterHref('critical') },
          { label: 'Habis (0)', value: 'out', href: buildFilterHref('out') },
        ]}
        searchQuery={{ name: 'search', placeholder: 'Cari nama atau SKU...', defaultValue: sp.search }}
      />

      {/* Category dropdown — sejajar filter pills (di luar FilterBar supaya custom layout) */}
      {(categories ?? []).length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="cat-filter" className="font-bold text-ink-muted">
            Kategori:
          </label>
          <CategoryFilterLinks
            categories={categories ?? []}
            active={sp.category ?? ''}
            buildHref={(slug) => {
              const p = new URLSearchParams()
              if (filter !== 'all') p.set('filter', filter)
              if (slug) p.set('category', slug)
              if (sp.search) p.set('search', sp.search)
              if (sp.sort_by) p.set('sort_by', sp.sort_by)
              if (sp.sort_dir) p.set('sort_dir', sp.sort_dir)
              return `/admin/stok-monitor${p.toString() ? `?${p.toString()}` : ''}`
            }}
          />
        </div>
      ) : null}

      <div className="mt-4">
        <StockMonitorTableClient
          rows={data?.products ?? []}
          categories={categories ?? []}
          rowOffset={rowOffset}
          sortBy={sp.sort_by ?? null}
          sortDir={sp.sort_dir ?? 'asc'}
          sortBasePath={sortBasePath}
        />

        {data?.pagination ? (
          <Pagination
            page={data.pagination.page}
            limit={data.pagination.limit}
            total={data.pagination.total}
            basePath={basePath}
          />
        ) : null}
      </div>
    </div>
  )
}

function CategoryFilterLinks({
  categories,
  active,
  buildHref,
}: {
  categories: Category[]
  active: string
  buildHref: (slug: string) => string
}) {
  const pills = [{ slug: '', name: 'Semua' }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))]
  return (
    <div className="flex flex-wrap gap-1.5">
      {pills.map((p) => {
        const isActive = (active || '') === p.slug
        return (
          <a
            key={p.slug || 'all'}
            href={buildHref(p.slug)}
            className={
              isActive
                ? 'rounded-md border-2 border-black bg-brand-500 px-2.5 py-1 text-xs font-bold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)]'
                : 'rounded-md border-2 border-black/15 bg-white px-2.5 py-1 text-xs font-bold text-ink-muted hover:border-brand-400 hover:text-brand-700 transition-colors'
            }
          >
            {p.name}
          </a>
        )
      })}
    </div>
  )
}
