import Link from 'next/link'
import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
import { StockBadge } from '@/components/admin/stock-badge'
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

type Props = { searchParams: Promise<{ status?: string }> }

export const metadata = { title: 'Admin — Produk' }

export default async function AdminProdukPage({ searchParams }: Props) {
  const sp = await searchParams
  const data = await adminFetch<ListResponse>(`/admin/products${sp.status ? `?status=${sp.status}` : ''}`)

  return (
    <div className="px-8 py-8">
      <AdminHeader
        title="Produk"
        subtitle={`${data?.pagination.total ?? 0} produk`}
        rightSlot={
          <Link href="/admin/produk/baru" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
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
              key: 'name',
              header: 'Produk',
              render: (r) => {
                const row = r as unknown as ProductRow
                const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories
                return (
                  <Link href={`/admin/produk/${row.id}`} className="hover:text-primary">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-text-subtle">{cat?.name ?? '—'} · {row.duration_days} hari</div>
                  </Link>
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
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${active ? 'bg-success/15 text-success' : 'bg-zinc-800 text-zinc-400'}`}>
                    {active ? 'Aktif' : 'Draft'}
                  </span>
                )
              },
              align: 'center',
            },
          ]}
        />
      </div>
    </div>
  )
}
