import Link from 'next/link'
import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
import { StockBadge } from '@/components/admin/stock-badge'
import { Pagination } from '@/components/admin/pagination'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah } from '@/lib/utils'

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

type Props = { searchParams: Promise<{ status?: string; page?: string }> }

export const metadata = { title: 'Admin — Produk' }

export default async function AdminProdukPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const params = new URLSearchParams()
  if (sp.status) params.set('status', sp.status)
  params.set('page', String(page))
  const data = await adminFetch<ListResponse>(`/admin/products?${params.toString()}`)

  const filterParams = new URLSearchParams()
  if (sp.status) filterParams.set('status', sp.status)
  const basePath = `/admin/produk${filterParams.toString() ? `?${filterParams.toString()}` : ''}`

  // Offset untuk numbering global (cross-page): (page - 1) * limit
  const rowOffset = ((data?.pagination.page ?? 1) - 1) * (data?.pagination.limit ?? 0)

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title="Produk"
        subtitle={`${data?.pagination.total ?? 0} produk`}
        rightSlot={
          <Link
            href="/admin/produk/baru"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-ink font-extrabold px-5 py-2.5 text-sm border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
          >
            + Tambah Produk
          </Link>
        }
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
        <DataTable
          rows={(data?.products ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            {
              key: 'no',
              header: 'No',
              render: (_r, idx) => (
                <span className="font-mono text-xs font-bold text-ink-subtle tabular-nums">
                  {rowOffset + idx + 1}
                </span>
              ),
              align: 'center',
              className: 'w-12',
            },
            {
              key: 'name',
              header: 'Produk',
              render: (r) => {
                const row = r as unknown as ProductRow
                const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories
                return (
                  <Link href={`/admin/produk/${row.id}`} className="hover:text-brand-700">
                    <div className="font-bold text-ink">{row.name}</div>
                    <div className="text-xs text-ink-subtle font-medium">{cat?.name ?? '—'} · {row.duration_days} hari</div>
                  </Link>
                )
              },
            },
            {
              key: 'sku',
              header: 'SKU',
              render: (r) => {
                const row = r as unknown as ProductRow
                return (
                  <span className="inline-flex items-center rounded-md border border-black/10 bg-brand-50/40 px-2 py-1 font-mono text-xs font-bold text-ink-muted">
                    {row.slug}
                  </span>
                )
              },
            },
            { key: 'price', header: 'Harga', render: (r) => formatRupiah((r as unknown as ProductRow).price), align: 'right' },
            { key: 'stock_count', header: 'Stok', render: (r) => <StockBadge count={(r as unknown as ProductRow).stock_count} />, align: 'center' },
            { key: 'sold_count', header: 'Terjual', render: (r) => (r as unknown as ProductRow).sold_count.toLocaleString('id-ID'), align: 'right' },
            {
              key: 'is_active',
              header: 'Status',
              render: (r) => {
                const active = (r as unknown as ProductRow).is_active
                return (
                  <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold whitespace-nowrap ${active ? 'bg-success/15 text-success border-success/40' : 'bg-gray-100 text-ink-muted border-gray-300'}`}>
                    {active ? 'Aktif' : 'Draft'}
                  </span>
                )
              },
              align: 'center',
            },
          ]}
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
