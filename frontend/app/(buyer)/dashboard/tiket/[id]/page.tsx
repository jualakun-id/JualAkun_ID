import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Image as ImageIcon, MessageCircle, Package } from 'lucide-react'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { TicketStatusBadge, REASON_LABELS } from '../ticket-helpers'
import { createServerClient } from '@/lib/supabase-server'
import { serverFetch } from '@/lib/server-fetch'
import { formatDateTime } from '@/lib/utils'

type TicketDetail = {
  id: string
  reason: string
  description: string | null
  screenshot_url: string | null
  status: string
  resolution: string | null
  created_at: string
  resolved_at: string | null
  orders: {
    id: string
    order_number: string
    products: { name: string; slug: string; thumbnail_url: string | null } | null
  } | null
}

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'Detail Tiket' }

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const ticket = await serverFetch<TicketDetail>(`/tickets/${id}`, {
    jwt: session?.access_token,
    cache: 'no-store',
  })
  if (!ticket) notFound()

  const isResolved = ['resolved_replaced', 'resolved_refunded', 'rejected', 'closed'].includes(
    ticket.status,
  )

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <DashboardTabs active="/dashboard/tiket" />

      <div className="max-w-3xl">
        <Link
          href="/dashboard/tiket"
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-ink-muted hover:text-brand-700"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Kembali ke daftar tiket
        </Link>

        {/* Header */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-xs text-ink-muted font-medium">Tiket #{ticket.id.slice(0, 8)}</div>
            <h1 className="mt-1 font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight leading-tight">
              {REASON_LABELS[ticket.reason] ?? ticket.reason}
            </h1>
          </div>
          <div className="shrink-0">
            <TicketStatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Order ref */}
        <Link
          href={`/dashboard/pesanan/${ticket.orders?.id ?? ''}`}
          className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-black bg-white p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-150"
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-black/15 bg-brand-50">
            {ticket.orders?.products?.thumbnail_url ? (
              <Image
                src={ticket.orders.products.thumbnail_url}
                alt={ticket.orders.products.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-subtle">
                <Package size={20} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs text-ink-muted font-medium">
              {ticket.orders?.order_number ?? '—'}
            </div>
            <div className="text-sm font-bold text-ink truncate">
              {ticket.orders?.products?.name ?? 'Produk dihapus'}
            </div>
          </div>
          <ExternalLink size={16} className="text-ink-muted shrink-0" />
        </Link>

        {/* Timeline */}
        <div className="mt-6 space-y-4">
          {/* User claim */}
          <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-700">
              <MessageCircle size={16} strokeWidth={2.25} />
              Klaim kamu
              <span className="ml-auto text-xs text-ink-muted font-medium">
                {formatDateTime(ticket.created_at)}
              </span>
            </div>

            {ticket.description ? (
              <p className="mt-3 text-[15px] text-ink leading-relaxed font-medium whitespace-pre-line">
                {ticket.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink-subtle italic font-medium">
                Tidak ada kronologi tertulis
              </p>
            )}

            {ticket.screenshot_url ? (
              <a
                href={ticket.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800 underline underline-offset-2"
              >
                <ImageIcon size={14} strokeWidth={2.5} />
                Lihat screenshot bukti
              </a>
            ) : null}
          </div>

          {/* Admin response */}
          {isResolved && ticket.resolution ? (
            <div className="rounded-2xl border-2 border-success/40 bg-success/10 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-success">
                <MessageCircle size={16} strokeWidth={2.25} />
                Respons admin
                {ticket.resolved_at ? (
                  <span className="ml-auto text-xs text-success/70 font-medium">
                    {formatDateTime(ticket.resolved_at)}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-[15px] text-success leading-relaxed font-medium whitespace-pre-line">
                {ticket.resolution}
              </p>
            </div>
          ) : ticket.status === 'in_review' ? (
            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-brand-700">
                <MessageCircle size={16} strokeWidth={2.25} />
                Sedang di-review admin
              </div>
              <p className="mt-2 text-sm text-brand-700 font-medium leading-relaxed">
                Tim kami sedang verifikasi klaim kamu. Update akan muncul di sini.
              </p>
            </div>
          ) : ticket.status === 'open' ? (
            <div className="rounded-2xl border-2 border-warning/40 bg-warning/10 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-warning">
                <MessageCircle size={16} strokeWidth={2.25} />
                Menunggu review admin
              </div>
              <p className="mt-2 text-sm text-warning font-medium leading-relaxed">
                Klaim diterima. Admin akan respons dalam <strong>1×24 jam</strong>.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
