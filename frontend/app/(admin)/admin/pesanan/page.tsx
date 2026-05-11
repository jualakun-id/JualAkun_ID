import Link from 'next/link'
import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/admin/status-badge'
import { Pagination } from '@/components/admin/pagination'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDateTime } from '@/lib/utils'

type OrderRow = {
  id: string
  order_number: string
  total_idr: number
  status: string
  payment_method: string | null
  created_at: string
  products: { name: string } | { name: string }[]
}

type ListResponse = {
  orders: OrderRow[]
  pagination: { page: number; limit: number; total: number }
}

type Props = { searchParams: Promise<{ status?: string; search?: string; page?: string }> }

export const metadata = { title: 'Admin — Pesanan' }

export default async function AdminPesananPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const params = new URLSearchParams()
  if (sp.status) params.set('status', sp.status)
  if (sp.search) params.set('search', sp.search)
  params.set('page', String(page))
  params.set('limit', '10')
  const data = await adminFetch<ListResponse>(`/admin/orders?${params.toString()}`)

  // Build basePath untuk pagination (preserve other filters)
  const filterParams = new URLSearchParams()
  if (sp.status) filterParams.set('status', sp.status)
  if (sp.search) filterParams.set('search', sp.search)
  const basePath = `/admin/pesanan${filterParams.toString() ? `?${filterParams.toString()}` : ''}`

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Pesanan" subtitle={`${data?.pagination.total ?? 0} total`} />

      <FilterBar
        activeValue={sp.status ?? 'all'}
        pills={[
          { label: 'Semua', value: 'all', href: '/admin/pesanan' },
          { label: 'Menunggu Bayar', value: 'pending_payment', href: '/admin/pesanan?status=pending_payment' },
          { label: 'Dibayar', value: 'paid', href: '/admin/pesanan?status=paid' },
          { label: 'Terkirim', value: 'delivered', href: '/admin/pesanan?status=delivered' },
          { label: 'Selesai', value: 'confirmed', href: '/admin/pesanan?status=confirmed' },
          { label: 'Gagal Kirim', value: 'delivery_failed', href: '/admin/pesanan?status=delivery_failed' },
          { label: 'Expired', value: 'expired', href: '/admin/pesanan?status=expired' },
        ]}
        searchQuery={{ name: 'search', placeholder: 'Cari order# atau nama...', defaultValue: sp.search }}
      />

      <div className="mt-4">
        <DataTable
          rows={(data?.orders ?? []) as unknown as Record<string, unknown>[]}
          rowClassName={(r) => {
            const row = r as unknown as OrderRow
            if (row.status === 'delivery_failed') return 'bg-danger/5'
            return ''
          }}
          columns={[
            {
              key: 'order_number',
              header: 'Order #',
              render: (r) => {
                const row = r as unknown as OrderRow
                const product = Array.isArray(row.products) ? row.products[0] : row.products
                return (
                  <Link href={`/admin/pesanan/${row.id}`} className="hover:text-brand-700">
                    <div className="font-mono text-xs">{row.order_number}</div>
                    <div className="mt-0.5 text-xs text-ink-subtle">{product?.name}</div>
                  </Link>
                )
              },
            },
            { key: 'payment_method', header: 'Pembayaran', render: (r) => (r as unknown as OrderRow).payment_method ?? '—' },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge variant="order" status={(r as unknown as OrderRow).status} />, align: 'center' },
            { key: 'total_idr', header: 'Total', render: (r) => formatRupiah((r as unknown as OrderRow).total_idr), align: 'right' },
            { key: 'created_at', header: 'Waktu', render: (r) => formatDateTime((r as unknown as OrderRow).created_at) },
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
