import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
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
  user_id: string
  orders: { order_number: string; products: { name: string } | { name: string }[] } | { order_number: string; products: { name: string } | { name: string }[] }[]
  buyer: { full_name: string | null; phone_wa: string | null } | null
}

type ListResponse = {
  tickets: TicketRow[]
  pagination: { page: number; limit: number; total: number }
  metrics: { open_count: number; in_review_count: number; sla_breach_count: number }
}

type Props = {
  searchParams: Promise<{
    status?: string
    reason?: string
    search?: string
    page?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }>
}

export const metadata = { title: 'Admin — Tiket' }

/** SLA breach: open > 24 jam — perlu admin attention */
function slaBreachClass(t: TicketRow): string {
  if (t.status !== 'open') return ''
  const ageHours = (Date.now() - new Date(t.created_at).getTime()) / 3_600_000
  if (ageHours >= 48) return 'bg-danger/10'
  if (ageHours >= 24) return 'bg-warning/10'
  return ''
}

export default async function AdminTiketPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const params = new URLSearchParams()
  if (sp.status) params.set('status', sp.status)
  if (sp.reason) params.set('reason', sp.reason)
  if (sp.search) params.set('search', sp.search)
  params.set('page', String(page))
  params.set('limit', '10')
  if (sp.sort_by) params.set('sort_by', sp.sort_by)
  if (sp.sort_dir) params.set('sort_dir', sp.sort_dir)
  const data = await adminFetch<ListResponse>(`/admin/tickets?${params.toString()}`)

  const pagBaseParams = new URLSearchParams()
  if (sp.status) pagBaseParams.set('status', sp.status)
  if (sp.reason) pagBaseParams.set('reason', sp.reason)
  if (sp.search) pagBaseParams.set('search', sp.search)
  if (sp.sort_by) pagBaseParams.set('sort_by', sp.sort_by)
  if (sp.sort_dir) pagBaseParams.set('sort_dir', sp.sort_dir)
  const basePath = `/admin/tiket${pagBaseParams.toString() ? `?${pagBaseParams.toString()}` : ''}`

  const sortBaseParams = new URLSearchParams()
  if (sp.status) sortBaseParams.set('status', sp.status)
  if (sp.reason) sortBaseParams.set('reason', sp.reason)
  if (sp.search) sortBaseParams.set('search', sp.search)
  const sortBasePath = `/admin/tiket${sortBaseParams.toString() ? `?${sortBaseParams.toString()}` : ''}`

  const metrics = data?.metrics
  const subtitleParts = [
    `${data?.pagination.total ?? 0} ditampilkan`,
    metrics && metrics.open_count > 0 ? `${metrics.open_count} open` : null,
    metrics && metrics.in_review_count > 0 ? `${metrics.in_review_count} review` : null,
    metrics && metrics.sla_breach_count > 0 ? `⚠ ${metrics.sla_breach_count} SLA breach` : null,
  ].filter(Boolean)

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Tiket Garansi" subtitle={subtitleParts.join(' · ')} />
      <FilterBar
        activeValue={sp.status ?? 'all'}
        pills={[
          { label: 'Semua', value: 'all', href: '/admin/tiket' },
          { label: 'Open', value: 'open', href: '/admin/tiket?status=open' },
          { label: 'In Review', value: 'in_review', href: '/admin/tiket?status=in_review' },
          { label: 'Resolved', value: 'resolved', href: '/admin/tiket?status=resolved' },
          { label: 'Rejected', value: 'rejected', href: '/admin/tiket?status=rejected' },
          { label: 'Closed', value: 'closed', href: '/admin/tiket?status=closed' },
        ]}
        searchQuery={{ name: 'search', placeholder: 'Cari deskripsi / order#...', defaultValue: sp.search }}
      />
      <div className="mt-4">
        <DataTable
          rows={(data?.tickets ?? []) as unknown as Record<string, unknown>[]}
          sortBy={sp.sort_by ?? null}
          sortDir={sp.sort_dir ?? 'desc'}
          sortBasePath={sortBasePath}
          rowClassName={(r) => slaBreachClass(r as unknown as TicketRow)}
          emptyMessage="Belum ada tiket yang cocok dengan filter."
          columns={[
            {
              key: 'id',
              header: 'Tiket',
              render: (r) => {
                const row = r as unknown as TicketRow
                const order = Array.isArray(row.orders) ? row.orders[0] : row.orders
                const product = Array.isArray(order?.products) ? order.products[0] : order?.products
                const ageHours = (Date.now() - new Date(row.created_at).getTime()) / 3_600_000
                const isBreach = row.status === 'open' && ageHours >= 24
                return (
                  <Link href={`/admin/tiket/${row.id}`} className="hover:text-brand-700">
                    <div className="font-mono text-xs flex items-center gap-1.5">
                      {row.id.slice(0, 8)}
                      {isBreach ? (
                        <span title={`Open > ${Math.round(ageHours)} jam — perlu attention`}>
                          <AlertTriangle size={11} strokeWidth={2.5} className={ageHours >= 48 ? 'text-danger' : 'text-warning'} />
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-subtle">{order?.order_number} · {product?.name}</div>
                  </Link>
                )
              },
            },
            {
              key: 'buyer',
              header: 'Buyer',
              render: (r) => {
                const row = r as unknown as TicketRow
                return (
                  <div className="text-xs">
                    <div className="text-ink font-medium">{row.buyer?.full_name ?? '—'}</div>
                    <div className="text-ink-subtle font-mono">{row.buyer?.phone_wa ?? ''}</div>
                  </div>
                )
              },
            },
            { key: 'reason', header: 'Alasan', sortKey: 'reason', render: (r) => <span className="text-xs uppercase font-bold">{(r as unknown as TicketRow).reason}</span> },
            { key: 'status', header: 'Status', sortKey: 'status', render: (r) => <StatusBadge variant="ticket" status={(r as unknown as TicketRow).status} />, align: 'center' },
            { key: 'created_at', header: 'Dibuat', sortKey: 'created_at', render: (r) => <span className="text-xs tabular-nums">{formatDateTime((r as unknown as TicketRow).created_at)}</span> },
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
