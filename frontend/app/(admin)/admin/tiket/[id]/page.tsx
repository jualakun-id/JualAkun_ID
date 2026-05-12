import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ExternalLink, ShoppingBag, Wallet, Calendar, AlertTriangle, History } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { ResolveForm } from './resolve-form'
import { MarkInReviewButton } from './mark-in-review-button'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDateTime } from '@/lib/utils'

type TicketDetail = {
  id: string
  reason: string
  description: string | null
  screenshot_url: string | null
  status: string
  resolution: string | null
  resolved_at: string | null
  created_at: string
  order: {
    id: string
    order_number: string
    total_idr: number
    paid_at: string | null
    delivered_at: string | null
    status: string
    product: { name: string; slug: string; thumbnail_url: string | null } | null
  }
  buyer_email: string | null
  buyer: { full_name: string | null; phone_wa: string | null } | null
  previous_tickets: Array<{ id: string; reason: string; status: string; created_at: string }>
  notifications: Array<{ id: string; channel: string; template: string; status: string; created_at: string }>
  available_stock_ids: string[]
}

type Props = { params: Promise<{ id: string }> }

export default async function AdminTiketDetailPage({ params }: Props) {
  const { id } = await params
  const ticket = await adminFetch<TicketDetail>(`/admin/tickets/${id}`)
  if (!ticket) notFound()

  const isResolved = ticket.status.startsWith('resolved') || ticket.status === 'rejected' || ticket.status === 'closed'
  const ageHours = (Date.now() - new Date(ticket.created_at).getTime()) / 3_600_000
  const isSLABreach = ticket.status === 'open' && ageHours >= 24
  const product = ticket.order.product

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title={`Tiket ${ticket.id.slice(0, 8)}`}
        subtitle={`${ticket.order.order_number} · ${product?.name ?? '—'}`}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            {isSLABreach ? (
              <span className={`inline-flex items-center gap-1 rounded-md border-2 px-2 py-0.5 text-xs font-bold ${ageHours >= 48 ? 'border-danger bg-danger/10 text-danger' : 'border-warning bg-warning/10 text-warning'}`}>
                <AlertTriangle size={11} strokeWidth={2.5} />
                {Math.round(ageHours)}j open
              </span>
            ) : null}
            <StatusBadge variant="ticket" status={ticket.status} />
            {ticket.status === 'open' ? <MarkInReviewButton ticketId={id} /> : null}
          </div>
        }
      />

      {/* Order context KPI strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiSmall
          icon={<ShoppingBag size={16} strokeWidth={2.25} />}
          label="Order"
          value={
            <Link href={`/admin/pesanan/${ticket.order.id}`} className="hover:text-brand-700 inline-flex items-center gap-1">
              {ticket.order.order_number} <ExternalLink size={11} strokeWidth={2.5} />
            </Link>
          }
        />
        <KpiSmall icon={<Wallet size={16} strokeWidth={2.25} />} label="Nilai Order" value={formatRupiah(ticket.order.total_idr)} />
        <KpiSmall
          icon={<Calendar size={16} strokeWidth={2.25} />}
          label="Dibayar"
          value={ticket.order.paid_at ? formatDateTime(ticket.order.paid_at) : '—'}
        />
        <KpiSmall
          icon={<Calendar size={16} strokeWidth={2.25} />}
          label="Terkirim"
          value={ticket.order.delivered_at ? formatDateTime(ticket.order.delivered_at) : '—'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Main content: Info tiket + Buyer + Resolve form */}
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
            <h2 className="font-heading text-xl font-extrabold tracking-tight">Info Tiket</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <BuyerRow email={ticket.buyer_email} fullName={ticket.buyer?.full_name ?? null} />
              <Row
                label="WhatsApp"
                value={
                  ticket.buyer?.phone_wa ? (
                    <a href={`https://wa.me/${ticket.buyer.phone_wa}`} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline font-mono">
                      {ticket.buyer.phone_wa}
                    </a>
                  ) : (
                    '—'
                  )
                }
              />
              <Row label="Alasan" value={<span className="uppercase font-bold">{ticket.reason}</span>} />
              <Row label="Dibuat" value={formatDateTime(ticket.created_at)} />
              {ticket.resolved_at ? <Row label="Diresolve" value={formatDateTime(ticket.resolved_at)} /> : null}
            </dl>
            {ticket.description ? (
              <div className="mt-4">
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Deskripsi</div>
                <p className="whitespace-pre-line rounded-md border-2 border-black/10 bg-brand-50/40 p-3 text-sm">
                  {ticket.description}
                </p>
              </div>
            ) : null}
            {ticket.screenshot_url ? (
              <div className="mt-4">
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Screenshot</div>
                <a
                  href={ticket.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block relative rounded-lg border-2 border-black overflow-hidden shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all"
                >
                  <Image
                    src={ticket.screenshot_url}
                    alt="Screenshot tiket"
                    width={300}
                    height={200}
                    className="object-cover"
                    unoptimized
                  />
                </a>
              </div>
            ) : null}
          </div>

          {/* Resolution panel */}
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
            <h2 className="font-heading text-xl font-extrabold tracking-tight">Resolusi</h2>
            {isResolved ? (
              <div className="mt-3 rounded-md border-2 border-success/30 bg-success/5 p-3">
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Resolusi tercatat</div>
                <p className="text-sm text-ink whitespace-pre-line">{ticket.resolution ?? '—'}</p>
              </div>
            ) : (
              <ResolveForm ticketId={id} availableStockIds={ticket.available_stock_ids} />
            )}
          </div>
        </div>

        {/* Sidebar: Product card + Previous tickets + Notif log */}
        <div className="space-y-4">
          {product ? (
            <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
              <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Produk</div>
              <div className="flex items-center gap-3">
                {product.thumbnail_url ? (
                  <Image src={product.thumbnail_url} alt={product.name} width={48} height={48} className="rounded-md border-2 border-black/10 object-cover" unoptimized />
                ) : (
                  <div className="w-12 h-12 rounded-md border-2 border-dashed border-black/15 bg-brand-50" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-ink truncate">{product.name}</div>
                  <Link
                    href={`/admin/produk?search=${encodeURIComponent(product.slug)}`}
                    className="text-xs text-brand-700 hover:underline inline-flex items-center gap-0.5"
                  >
                    Buka di Produk <ExternalLink size={10} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-1.5 mb-2">
              <History size={14} strokeWidth={2.5} className="text-brand-600" />
              <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Riwayat Tiket Buyer</h3>
            </div>
            {ticket.previous_tickets.length === 0 ? (
              <p className="text-xs text-ink-subtle italic">Tidak ada tiket sebelumnya dari buyer ini.</p>
            ) : (
              <div className="space-y-1.5">
                {ticket.previous_tickets.map((t) => (
                  <Link
                    key={t.id}
                    href={`/admin/tiket/${t.id}`}
                    className="block rounded-md border border-black/10 bg-brand-50/30 px-2.5 py-1.5 hover:border-brand-400 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[10px] text-ink-subtle">{t.id.slice(0, 8)}</span>
                      <StatusBadge variant="ticket" status={t.status} />
                    </div>
                    <div className="mt-0.5 text-xs">
                      <span className="uppercase font-bold text-ink">{t.reason}</span>
                      <span className="ml-1 text-ink-subtle">· {formatDateTime(t.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Notif Order Terkait</div>
            {ticket.notifications.length === 0 ? (
              <p className="text-xs text-ink-subtle italic">Belum ada notif untuk order ini.</p>
            ) : (
              <div className="space-y-1.5">
                {ticket.notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="rounded-md border border-black/10 bg-brand-50/30 px-2.5 py-1.5 flex items-baseline justify-between gap-2">
                    <div className="text-xs min-w-0">
                      <div className="font-mono uppercase text-ink-muted truncate">{n.channel} · {n.template}</div>
                      <div className="text-ink-subtle text-[10px]">{formatDateTime(n.created_at)}</div>
                    </div>
                    <StatusBadge variant="notification" status={n.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Link href="/admin/tiket" className="mt-6 inline-block text-sm text-ink-muted hover:text-ink">
        ← Kembali ke daftar tiket
      </Link>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="contents">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  )
}

function BuyerRow({ email, fullName }: { email: string | null; fullName: string | null }) {
  if (!email && !fullName) return <Row label="Buyer" value="—" />
  return (
    <div className="contents">
      <dt className="text-ink-muted">Buyer</dt>
      <dd>
        {email ? (
          <Link
            href={`/admin/pengguna?search=${encodeURIComponent(email.split('@')[0])}`}
            className="text-ink hover:text-brand-700 underline underline-offset-2 decoration-dotted"
          >
            {fullName ?? email}
          </Link>
        ) : (
          fullName
        )}
      </dd>
    </div>
  )
}

function KpiSmall({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[0_2px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-ink-muted uppercase tracking-wider">
        <span className="text-brand-600">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-ink truncate">{value}</div>
    </div>
  )
}
