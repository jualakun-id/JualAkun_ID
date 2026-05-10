import Link from 'next/link'
import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/admin/status-badge'
import { Pagination } from '@/components/admin/pagination'
import { adminFetch } from '@/lib/admin-fetch'
import { formatDateTime } from '@/lib/utils'

type TicketRow = {
  id: string
  reason: string
  status: string
  created_at: string
  orders: { order_number: string; products: { name: string } | { name: string }[] } | { order_number: string; products: { name: string } | { name: string }[] }[]
}

type ListResponse = {
  tickets: TicketRow[]
  pagination: { page: number; limit: number; total: number }
}

type Props = { searchParams: Promise<{ status?: string; page?: string }> }

export const metadata = { title: 'Admin — Tiket' }

export default async function AdminTiketPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const params = new URLSearchParams()
  if (sp.status) params.set('status', sp.status)
  params.set('page', String(page))
  const data = await adminFetch<ListResponse>(`/admin/tickets?${params.toString()}`)

  const filterParams = new URLSearchParams()
  if (sp.status) filterParams.set('status', sp.status)
  const basePath = `/admin/tiket${filterParams.toString() ? `?${filterParams.toString()}` : ''}`

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Tiket Garansi" subtitle={`${data?.pagination.total ?? 0} tiket`} />
      <FilterBar
        activeValue={sp.status ?? 'all'}
        pills={[
          { label: 'Semua', value: 'all', href: '/admin/tiket' },
          { label: 'Open', value: 'open', href: '/admin/tiket?status=open' },
          { label: 'In Review', value: 'in_review', href: '/admin/tiket?status=in_review' },
          { label: 'Resolved', value: 'resolved_replaced', href: '/admin/tiket?status=resolved_replaced' },
        ]}
      />
      <div className="mt-4">
        <DataTable
          rows={(data?.tickets ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            {
              key: 'id',
              header: 'Tiket',
              render: (r) => {
                const row = r as unknown as TicketRow
                const order = Array.isArray(row.orders) ? row.orders[0] : row.orders
                const product = Array.isArray(order?.products) ? order.products[0] : order?.products
                return (
                  <Link href={`/admin/tiket/${row.id}`} className="hover:text-brand-700">
                    <div className="font-mono text-xs">{row.id.slice(0, 8)}</div>
                    <div className="mt-0.5 text-xs text-ink-subtle">{order?.order_number} · {product?.name}</div>
                  </Link>
                )
              },
            },
            { key: 'reason', header: 'Alasan', render: (r) => <span className="text-xs uppercase">{(r as unknown as TicketRow).reason}</span> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge variant="ticket" status={(r as unknown as TicketRow).status} />, align: 'center' },
            { key: 'created_at', header: 'Dibuat', render: (r) => formatDateTime((r as unknown as TicketRow).created_at) },
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
