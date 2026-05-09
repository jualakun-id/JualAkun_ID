import Link from 'next/link'
import Image from 'next/image'
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
    <section className="container mx-auto px-4 py-8">
      <DashboardTabs active="/dashboard/pesanan" />
      <h1 className="mt-8 font-heading text-h1">Pesanan Saya</h1>

      <div className="mt-6 space-y-3">
        {data?.orders?.map((o) => (
          <Link
            key={o.id}
            href={`/dashboard/pesanan/${o.id}`}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 hover:border-primary/50"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {o.product_thumbnail ? (
                <Image src={o.product_thumbnail} alt={o.product_name} fill sizes="64px" className="object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-text-subtle">{o.order_number}</div>
              <div className="mt-0.5 truncate font-medium text-text">{o.product_name}</div>
              <div className="mt-0.5 text-xs text-text-subtle">{formatDateTime(o.created_at)}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <OrderStatusBadge status={o.status} />
              <span className="font-heading font-bold text-primary">{formatRupiah(o.total_idr)}</span>
            </div>
          </Link>
        ))}
        {!data?.orders?.length ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
            Belum ada pesanan.
          </div>
        ) : null}
      </div>
    </section>
  )
}
