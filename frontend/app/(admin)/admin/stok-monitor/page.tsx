import Link from 'next/link'
import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
import { StockBadge } from '@/components/admin/stock-badge'
import { adminFetch } from '@/lib/admin-fetch'

type StockRow = {
  id: string
  name: string
  slug: string
  stock_count: number
  sold_count: number
  thumbnail_url: string | null
  categories: { name: string; slug: string } | { name: string; slug: string }[]
}

type Props = { searchParams: Promise<{ filter?: string }> }

export const metadata = { title: 'Admin — Stok Monitor' }

export default async function AdminStokMonitorPage({ searchParams }: Props) {
  const sp = await searchParams
  const filter = (sp.filter ?? 'all') as 'all' | 'critical' | 'out'
  const data = await adminFetch<StockRow[]>(`/admin/stock-monitor?filter=${filter}`)

  const out = (data ?? []).filter((r) => r.stock_count === 0).length
  const critical = (data ?? []).filter((r) => r.stock_count > 0 && r.stock_count <= 5).length

  return (
    <div className="px-8 py-8">
      <AdminHeader title="Stok Monitor" subtitle={`${out} habis · ${critical} kritis`} />
      <FilterBar
        activeValue={filter}
        pills={[
          { label: 'Semua', value: 'all', href: '/admin/stok-monitor' },
          { label: 'Kritis (≤5)', value: 'critical', href: '/admin/stok-monitor?filter=critical' },
          { label: 'Habis (0)', value: 'out', href: '/admin/stok-monitor?filter=out' },
        ]}
      />
      <div className="mt-4">
        <DataTable
          rows={(data ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            {
              key: 'name',
              header: 'Produk',
              render: (r) => {
                const row = r as unknown as StockRow
                const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories
                return (
                  <Link href={`/admin/produk/${row.id}`} className="hover:text-primary">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-text-subtle">{cat?.name}</div>
                  </Link>
                )
              },
            },
            { key: 'stock_count', header: 'Stok', render: (r) => <StockBadge count={(r as unknown as StockRow).stock_count} />, align: 'center' },
            { key: 'sold_count', header: 'Terjual', render: (r) => (r as unknown as StockRow).sold_count.toLocaleString('id-ID'), align: 'right' },
            {
              key: 'action',
              header: '',
              render: (r) => (
                <Link
                  href={`/admin/produk/${(r as unknown as StockRow).id}`}
                  className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary-light hover:bg-primary/20"
                >
                  + Stok
                </Link>
              ),
              align: 'right',
            },
          ]}
        />
      </div>
    </div>
  )
}
