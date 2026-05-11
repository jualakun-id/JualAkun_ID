import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { Pagination } from '@/components/admin/pagination'
import { ActivityFeedClient } from './activity-feed-client'
import { adminFetch } from '@/lib/admin-fetch'

type EventType =
  | 'user_registered'
  | 'order_created'
  | 'order_paid'
  | 'order_delivered'
  | 'order_refunded'
  | 'ticket_created'
  | 'ticket_resolved'

type ActivityRow = {
  id: string
  event_type: EventType
  ref_id: string | null
  ref_table: string | null
  title: string
  description: string | null
  metadata: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

type ListResponse = {
  logs: ActivityRow[]
  pagination: { page: number; limit: number; total: number }
  unread_count: number
}

type Props = {
  searchParams: Promise<{
    event_type?: string
    is_read?: string
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
  if (sp.event_type) params.set('event_type', sp.event_type)
  if (sp.is_read) params.set('is_read', sp.is_read)
  params.set('page', String(page))
  params.set('limit', '15')

  const data = await adminFetch<ListResponse>(`/admin/activity-log?${params.toString()}`)

  const pagBaseParams = new URLSearchParams()
  if (sp.event_type) pagBaseParams.set('event_type', sp.event_type)
  if (sp.is_read) pagBaseParams.set('is_read', sp.is_read)
  if (sp.sort_by) pagBaseParams.set('sort_by', sp.sort_by)
  if (sp.sort_dir) pagBaseParams.set('sort_dir', sp.sort_dir)
  const basePath = `/admin/notifikasi${pagBaseParams.toString() ? `?${pagBaseParams.toString()}` : ''}`

  const sortBaseParams = new URLSearchParams()
  if (sp.event_type) sortBaseParams.set('event_type', sp.event_type)
  if (sp.is_read) sortBaseParams.set('is_read', sp.is_read)
  const sortBasePath = `/admin/notifikasi${sortBaseParams.toString() ? `?${sortBaseParams.toString()}` : ''}`

  const total = data?.pagination.total ?? 0
  const unread = data?.unread_count ?? 0

  const buildPill = (val: string) => {
    const p = new URLSearchParams()
    if (val) p.set('event_type', val)
    if (sp.is_read) p.set('is_read', sp.is_read)
    return `/admin/notifikasi${p.toString() ? `?${p.toString()}` : ''}`
  }

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title="Notifikasi"
        subtitle={`${total} aktivitas · ${unread} belum dibaca`}
      />

      <FilterBar
        activeValue={sp.event_type ?? 'all'}
        pills={[
          { label: 'Semua', value: 'all', href: buildPill('') },
          { label: 'User Baru', value: 'user_registered', href: buildPill('user_registered') },
          { label: 'Pembayaran', value: 'order_paid', href: buildPill('order_paid') },
          { label: 'Pengiriman', value: 'order_delivered', href: buildPill('order_delivered') },
          { label: 'Refund', value: 'order_refunded', href: buildPill('order_refunded') },
          { label: 'Tiket', value: 'ticket_created', href: buildPill('ticket_created') },
        ]}
      />

      <div className="mt-4">
        <ActivityFeedClient
          rows={data?.logs ?? []}
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
