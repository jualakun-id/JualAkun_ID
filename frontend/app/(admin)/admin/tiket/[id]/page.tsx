import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { ResolveForm } from './resolve-form'
import { adminFetch } from '@/lib/admin-fetch'
import { formatDateTime } from '@/lib/utils'

type TicketDetail = {
  id: string
  reason: string
  description: string | null
  screenshot_url: string | null
  status: string
  resolution: string | null
  resolved_at: string | null
  created_at: string
  order: { id: string; order_number: string; product: { name: string } | null }
  buyer_email: string | null
  available_stock_ids: string[]
}

type Props = { params: Promise<{ id: string }> }

export default async function AdminTiketDetailPage({ params }: Props) {
  const { id } = await params
  const ticket = await adminFetch<TicketDetail>(`/admin/tickets/${id}`)
  if (!ticket) notFound()

  const isResolved = ticket.status.startsWith('resolved') || ticket.status === 'rejected' || ticket.status === 'closed'

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title={`Tiket ${ticket.id.slice(0, 8)}`}
        subtitle={`${ticket.order.order_number} · ${ticket.order.product?.name ?? '—'}`}
        rightSlot={<StatusBadge variant="ticket" status={ticket.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Info Tiket</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Buyer" value={ticket.buyer_email ?? '—'} />
            <Row label="Alasan" value={ticket.reason} />
            <Row label="Dibuat" value={formatDateTime(ticket.created_at)} />
            {ticket.resolved_at ? <Row label="Diresolve" value={formatDateTime(ticket.resolved_at)} /> : null}
          </dl>
          {ticket.description ? (
            <div className="mt-4">
              <div className="text-sm font-medium text-ink-muted">Deskripsi</div>
              <p className="mt-1 whitespace-pre-line rounded-md border border-black/10 bg-brand-50/40 p-3 text-sm">
                {ticket.description}
              </p>
            </div>
          ) : null}
          {ticket.screenshot_url ? (
            <a
              href={ticket.screenshot_url}
              target="_blank"
              rel="noopener"
              className="mt-3 inline-block text-sm text-brand-700 hover:text-brand-700"
            >
              Lihat screenshot →
            </a>
          ) : null}
        </div>

        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Resolusi</h2>
          {isResolved ? (
            <p className="mt-3 text-sm text-ink-muted">
              Sudah diresolve: {ticket.resolution ?? '—'}
            </p>
          ) : (
            <ResolveForm ticketId={id} availableStockIds={ticket.available_stock_ids} />
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-20 shrink-0 text-ink-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  )
}
