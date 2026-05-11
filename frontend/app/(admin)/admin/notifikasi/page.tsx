import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/admin/status-badge'
import { Pagination } from '@/components/admin/pagination'
import { RetryButton } from './retry-button'
import { adminFetch } from '@/lib/admin-fetch'
import { formatDateTime } from '@/lib/utils'

type LogRow = {
  id: string
  channel: 'wa' | 'email'
  template: string
  status: 'pending' | 'sent' | 'failed'
  error: string | null
  created_at: string
}

type ListResponse = {
  logs: LogRow[]
  pagination: { page: number; limit: number; total: number }
}

type Props = {
  searchParams: Promise<{
    status?: string
    channel?: string
    page?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }>
}

export const metadata = { title: 'Admin — Notifikasi' }

export default async function AdminNotifikasiPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const params = new URLSearchParams()
  if (sp.status) params.set('status', sp.status)
  if (sp.channel) params.set('channel', sp.channel)
  params.set('page', String(page))
  params.set('limit', '10')
  if (sp.sort_by) params.set('sort_by', sp.sort_by)
  if (sp.sort_dir) params.set('sort_dir', sp.sort_dir)
  const data = await adminFetch<ListResponse>(`/admin/notifications?${params.toString()}`)

  const pagBaseParams = new URLSearchParams()
  if (sp.status) pagBaseParams.set('status', sp.status)
  if (sp.channel) pagBaseParams.set('channel', sp.channel)
  if (sp.sort_by) pagBaseParams.set('sort_by', sp.sort_by)
  if (sp.sort_dir) pagBaseParams.set('sort_dir', sp.sort_dir)
  const basePath = `/admin/notifikasi${pagBaseParams.toString() ? `?${pagBaseParams.toString()}` : ''}`

  const sortBaseParams = new URLSearchParams()
  if (sp.status) sortBaseParams.set('status', sp.status)
  if (sp.channel) sortBaseParams.set('channel', sp.channel)
  const sortBasePath = `/admin/notifikasi${sortBaseParams.toString() ? `?${sortBaseParams.toString()}` : ''}`

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Log Notifikasi" subtitle={`${data?.pagination.total ?? 0} notif`} />
      <FilterBar
        activeValue={sp.status ?? 'all'}
        pills={[
          { label: 'Semua', value: 'all', href: '/admin/notifikasi' },
          { label: 'Pending', value: 'pending', href: '/admin/notifikasi?status=pending' },
          { label: 'Terkirim', value: 'sent', href: '/admin/notifikasi?status=sent' },
          { label: 'Gagal', value: 'failed', href: '/admin/notifikasi?status=failed' },
        ]}
      />
      <div className="mt-4">
        <DataTable
          rows={(data?.logs ?? []) as unknown as Record<string, unknown>[]}
          sortBy={sp.sort_by ?? null}
          sortDir={sp.sort_dir ?? 'desc'}
          sortBasePath={sortBasePath}
          columns={[
            { key: 'channel', header: 'Channel', sortKey: 'channel', render: (r) => <span className="font-mono uppercase text-xs">{(r as unknown as LogRow).channel}</span> },
            { key: 'template', header: 'Template', sortKey: 'template', render: (r) => <span className="font-mono text-xs">{(r as unknown as LogRow).template}</span> },
            { key: 'status', header: 'Status', sortKey: 'status', render: (r) => <StatusBadge variant="notification" status={(r as unknown as LogRow).status} />, align: 'center' },
            { key: 'error', header: 'Error', render: (r) => <span className="text-xs text-danger">{(r as unknown as LogRow).error?.slice(0, 60) ?? '—'}</span> },
            { key: 'created_at', header: 'Waktu', sortKey: 'created_at', render: (r) => formatDateTime((r as unknown as LogRow).created_at) },
            {
              key: 'action',
              header: '',
              render: (r) => {
                const row = r as unknown as LogRow
                return row.status === 'failed' ? <RetryButton id={row.id} /> : null
              },
              align: 'right',
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
