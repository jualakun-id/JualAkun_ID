import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/admin/status-badge'
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

type Props = { searchParams: Promise<{ status?: string; channel?: string }> }

export const metadata = { title: 'Admin — Notifikasi' }

export default async function AdminNotifikasiPage({ searchParams }: Props) {
  const sp = await searchParams
  const params = new URLSearchParams()
  if (sp.status) params.set('status', sp.status)
  if (sp.channel) params.set('channel', sp.channel)
  const data = await adminFetch<ListResponse>(`/admin/notifications?${params.toString()}`)

  return (
    <div className="px-8 py-8">
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
          columns={[
            { key: 'channel', header: 'Channel', render: (r) => <span className="font-mono uppercase text-xs">{(r as unknown as LogRow).channel}</span> },
            { key: 'template', header: 'Template', render: (r) => <span className="font-mono text-xs">{(r as unknown as LogRow).template}</span> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge variant="notification" status={(r as unknown as LogRow).status} />, align: 'center' },
            { key: 'error', header: 'Error', render: (r) => <span className="text-xs text-danger">{(r as unknown as LogRow).error?.slice(0, 60) ?? '—'}</span> },
            { key: 'created_at', header: 'Waktu', render: (r) => formatDateTime((r as unknown as LogRow).created_at) },
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
      </div>
    </div>
  )
}
