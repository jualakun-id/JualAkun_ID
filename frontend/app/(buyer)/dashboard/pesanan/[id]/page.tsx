import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { OrderActions } from './order-actions'
import { createServerClient } from '@/lib/supabase-server'
import { serverFetch } from '@/lib/server-fetch'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import type { OrderStatus } from '@/types'

type OrderDetail = {
  id: string
  order_number: string
  amount_idr: number
  discount_idr: number
  credit_used_idr: number
  total_idr: number
  coupon_code: string | null
  status: OrderStatus
  payment_method: string | null
  payment_url: string | null
  delivered_at: string | null
  buyer_confirmed_at: string | null
  guarantee_expires_at: string | null
  expires_at: string | null
  created_at: string
  product: { id: string; name: string; slug: string; thumbnail_url: string | null; duration_days: number; guarantee_days: number }
}

type Props = { params: Promise<{ id: string }> }

export default async function DashboardPesananDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const order = await serverFetch<OrderDetail>(`/orders/${id}`, { jwt: session?.access_token, cache: 'no-store' })
  if (!order) notFound()

  return (
    <section className="container mx-auto max-w-3xl px-4 py-8">
      <DashboardTabs active="/dashboard/pesanan" />

      <div className="mt-8 flex items-center justify-between">
        <div>
          <div className="font-mono text-sm text-ink-subtle">{order.order_number}</div>
          <h1 className="mt-1 font-heading text-h1">{order.product.name}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <OrderActions order={order} jwt={session?.access_token ?? null} />

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-heading text-h3">Ringkasan Pesanan</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Harga produk" value={formatRupiah(order.amount_idr)} />
          {order.discount_idr > 0 ? <Row label={`Diskon ${order.coupon_code ?? ''}`} value={`-${formatRupiah(order.discount_idr)}`} /> : null}
          {order.credit_used_idr > 0 ? <Row label="Kredit dipakai" value={`-${formatRupiah(order.credit_used_idr)}`} /> : null}
          <hr className="border-gray-100" />
          <Row label="Total dibayar" value={formatRupiah(order.total_idr)} bold />
          <Row label="Metode pembayaran" value={order.payment_method ?? '—'} />
          <Row label="Dibuat" value={formatDateTime(order.created_at)} />
          {order.delivered_at ? <Row label="Terkirim" value={formatDateTime(order.delivered_at)} /> : null}
          {order.guarantee_expires_at ? <Row label="Garansi sampai" value={formatDateTime(order.guarantee_expires_at)} /> : null}
        </dl>

        {order.status === 'pending_payment' && order.payment_url ? (
          <a
            href={order.payment_url}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-2.5 font-semibold text-white hover:bg-brand-600"
          >
            Lanjutkan Pembayaran
          </a>
        ) : null}
      </div>

      {['delivered', 'confirmed'].includes(order.status) ? null : (
        <p className="mt-4 text-center text-sm text-ink-subtle">
          Akun akan ditampilkan di sini setelah pembayaran dikonfirmasi.
        </p>
      )}

      <div className="mt-6 text-center">
        <Link href="/dashboard/pesanan" className="text-sm text-ink-muted hover:text-brand-600">
          ← Kembali ke daftar pesanan
        </Link>
      </div>
    </section>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={bold ? 'font-heading font-bold text-brand-500' : 'text-ink'}>{value}</dd>
    </div>
  )
}
