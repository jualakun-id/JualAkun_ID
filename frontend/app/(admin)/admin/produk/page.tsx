import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { Pagination } from '@/components/admin/pagination'
import { AddProductButton } from './add-product-button'
import { ProductsTableClient } from './products-table-client'
import { adminFetch } from '@/lib/admin-fetch'
import type { Category } from '@/types'

type ProductRow = {
  id: string
  name: string
  slug: string
  price: number
  duration_days: number
  stock_count: number
  sold_count: number
  is_active: boolean
  thumbnail_url: string | null
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null
}

type ListResponse = {
  products: ProductRow[]
  pagination: { page: number; limit: number; total: number }
}

type Props = {
  searchParams: Promise<{
    status?: string
    page?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }>
}

export const metadata = { title: 'Admin — Produk' }

export default async function AdminProdukPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const params = new URLSearchParams()
  if (sp.status) params.set('status', sp.status)
  params.set('page', String(page))
  params.set('limit', '10')
  if (sp.sort_by) params.set('sort_by', sp.sort_by)
  if (sp.sort_dir) params.set('sort_dir', sp.sort_dir)

  const [data, categories] = await Promise.all([
    adminFetch<ListResponse>(`/admin/products?${params.toString()}`),
    adminFetch<Category[]>('/catalog/categories'),
  ])

  // Pagination basePath: preserve filter + sort (drop page only)
  const pagBaseParams = new URLSearchParams()
  if (sp.status) pagBaseParams.set('status', sp.status)
  if (sp.sort_by) pagBaseParams.set('sort_by', sp.sort_by)
  if (sp.sort_dir) pagBaseParams.set('sort_dir', sp.sort_dir)
  const basePath = `/admin/produk${pagBaseParams.toString() ? `?${pagBaseParams.toString()}` : ''}`

  // SortBasePath: preserve filter only (drop page + sort_by + sort_dir karena akan di-override)
  const sortBaseParams = new URLSearchParams()
  if (sp.status) sortBaseParams.set('status', sp.status)
  const sortBasePath = `/admin/produk${sortBaseParams.toString() ? `?${sortBaseParams.toString()}` : ''}`

  // Offset untuk numbering global (cross-page): (page - 1) * limit
  const rowOffset = ((data?.pagination.page ?? 1) - 1) * (data?.pagination.limit ?? 0)

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title="Produk"
        subtitle={`${data?.pagination.total ?? 0} produk`}
        rightSlot={<AddProductButton categories={categories ?? []} />}
      />

      <FilterBar
        activeValue={sp.status ?? 'all'}
        pills={[
          { label: 'Semua', value: 'all', href: '/admin/produk' },
          { label: 'Aktif', value: 'active', href: '/admin/produk?status=active' },
          { label: 'Draft', value: 'draft', href: '/admin/produk?status=draft' },
          { label: 'Stok Habis', value: 'out_of_stock', href: '/admin/produk?status=out_of_stock' },
        ]}
      />

      <div className="mt-4">
        <ProductsTableClient
          products={data?.products ?? []}
          categories={categories ?? []}
          rowOffset={rowOffset}
          sortBy={sp.sort_by ?? null}
          sortDir={sp.sort_dir ?? 'desc'}
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
