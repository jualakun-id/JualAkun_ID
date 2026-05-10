import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { createServerClient } from '@/lib/supabase-server'
import { serverFetch } from '@/lib/server-fetch'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import type { OrderStatus } from '@/types'

type OrdersResponse = {
  orders: { id: string; order_number: string; product_name: string; product_thumbnail: string | null; total_idr: number; status: OrderStatus; delivered_at: string | null; created_at: string }[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}

export const metadata = { title: 'Pesanan Saya' }

export default async function DashboardPesananPage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const data = await serverFetch<OrdersResponse>('/orders?limit=50', { jwt: session?.access_token, cache: 'no-store' })

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <DashboardTabs active="/dashboard/pesanan" />
      <h1 className="mt-8 font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
        Pesanan Saya
      </h1>
      <p className="mt-2 text-[15px] text-ink-muted font-medium">
        Riwayat semua transaksi kamu di Jualakun.id.
      </p>

      <div className="mt-6 space-y-3">
        {data?.orders?.map((o) => (
          <Link
            key={o.id}
            href={`/dashboard/pesanan/${o.id}`}
            className="flex items-center gap-4 rounded-xl border-2 border-black bg-white p-4 sm:p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-150"
          >
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 border-black/15 bg-brand-50">
              {o.product_thumbnail ? (
                <Image src={o.product_thumbnail} alt={o.product_name} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-subtle">
                  <Package size={24} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-ink-subtle font-medium">{o.order_number}</div>
              <div className="mt-1 truncate font-bold text-ink text-[15px]">{o.product_name}</div>
              <div className="mt-1 text-xs text-ink-muted font-medium">{formatDateTime(o.created_at)}</div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <OrderStatusBadge status={o.status} />
              <span className="font-heading font-extrabold text-ink text-base whitespace-nowrap">
                {formatRupiah(o.total_idr)}
              </span>
            </div>
          </Link>
        ))}
        {!data?.orders?.length ? (
          <div className="rounded-2xl border-2 border-dashed border-black/20 bg-white p-12 text-center">
            <Package size={36} className="mx-auto text-ink-subtle/50" strokeWidth={1.5} />
            <p className="mt-4 text-ink-muted font-medium">Belum ada pesanan apapun.</p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-400 text-ink font-extrabold px-5 py-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
            >
              Mulai belanja →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
