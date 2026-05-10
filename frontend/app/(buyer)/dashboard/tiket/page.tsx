import Link from 'next/link'
import { LifeBuoy, Plus } from 'lucide-react'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { TicketStatusBadge, REASON_LABELS } from './ticket-helpers'
import { createServerClient } from '@/lib/supabase-server'
import { serverFetch } from '@/lib/server-fetch'
import { formatDateTime } from '@/lib/utils'

type Ticket = {
  id: string
  reason: string
  description: string | null
  status: string
  resolution: string | null
  created_at: string
  resolved_at: string | null
  orders: {
    order_number: string
    products: { name: string } | null
  } | null
}

export const metadata = { title: 'Tiket Saya' }

export default async function DashboardTiketPage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const data = await serverFetch<{ tickets: Ticket[] }>('/tickets', {
    jwt: session?.access_token,
    cache: 'no-store',
  })

  const tickets = data?.tickets ?? []

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <DashboardTabs active="/dashboard/tiket" />

      <div className="mt-8 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
            Tiket Saya
          </h1>
          <p className="mt-2 text-[15px] text-ink-muted font-medium">
            Riwayat klaim garansi & laporan masalah pesanan kamu.
          </p>
        </div>
        <Link
          href="/dashboard/pesanan"
          className="inline-flex items-center gap-1.5 bg-white hover:bg-brand-50 text-ink font-extrabold px-4 py-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          Klaim dari Pesanan
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {tickets.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-black/20 bg-white p-12 text-center">
            <LifeBuoy size={36} className="mx-auto text-ink-subtle/50" strokeWidth={1.5} />
            <p className="mt-4 text-ink-muted font-medium">Belum ada tiket apapun.</p>
            <p className="mt-2 text-sm text-ink-subtle font-medium">
              Klaim garansi dibuat dari halaman detail pesanan.
            </p>
          </div>
        ) : (
          tickets.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/tiket/${t.id}`}
              className="block rounded-xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-ink-muted font-mono font-medium">
                    <span>{t.orders?.order_number ?? '—'}</span>
                  </div>
                  <div className="mt-1 font-bold text-ink text-[15px] truncate">
                    {t.orders?.products?.name ?? 'Produk dihapus'}
                  </div>
                  <div className="mt-1.5 text-sm text-ink-muted font-medium">
                    Alasan: <strong className="text-ink">{REASON_LABELS[t.reason] ?? t.reason}</strong>
                  </div>
                  <div className="mt-1 text-xs text-ink-muted font-medium">
                    Dibuat {formatDateTime(t.created_at)}
                  </div>
                </div>
                <TicketStatusBadge status={t.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}
