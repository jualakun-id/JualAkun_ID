import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { OrderActions } from './order-actions'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDateTime } from '@/lib/utils'

type OrderDetail = {
  id: string
  order_number: string
  amount_idr: number
  discount_idr: number
  credit_used_idr: number
  total_idr: number
  coupon_code: string | null
  status: string
  payment_method: string | null
  payment_transaction_id: string | null
  paid_at: string | null
  delivered_at: string | null
  created_at: string
  product: { name: string; slug: string } | null
  buyer: { email: string | null }
  notifications: { id: string; channel: string; template: string; status: string; created_at: string }[]
}

type Props = { params: Promise<{ id: string }> }

export default async function AdminPesananDetailPage({ params }: Props) {
  const { id } = await params
  const order = await adminFetch<OrderDetail>(`/admin/orders/${id}`)
  if (!order) notFound()

  return (
    <div className="px-8 py-8">
      <AdminHeader
        title={`Pesanan ${order.order_number}`}
        subtitle={order.product?.name ?? ''}
        rightSlot={<StatusBadge variant="order" status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-heading text-h3">Info Pesanan</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Row label="Buyer" value={order.buyer.email ?? '—'} />
            <Row label="Produk" value={order.product?.name ?? '—'} />
            <Row label="Subtotal" value={formatRupiah(order.amount_idr)} />
            <Row label="Diskon" value={`-${formatRupiah(order.discount_idr)}`} />
            <Row label="Kredit" value={`-${formatRupiah(order.credit_used_idr)}`} />
            <Row label="Total" value={formatRupiah(order.total_idr)} bold />
            <Row label="Kupon" value={order.coupon_code ?? '—'} />
            <Row label="Metode" value={order.payment_method ?? '—'} />
            <Row label="Trx ID" value={order.payment_transaction_id ?? '—'} />
            <Row label="Dibayar" value={order.paid_at ? formatDateTime(order.paid_at) : '—'} />
            <Row label="Terkirim" value={order.delivered_at ? formatDateTime(order.delivered_at) : '—'} />
            <Row label="Dibuat" value={formatDateTime(order.created_at)} />
          </dl>

          <OrderActions orderId={id} status={order.status} />
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-heading text-h3">Log Notifikasi</h2>
          <div className="mt-3 space-y-2">
            {order.notifications.length === 0 ? (
              <p className="text-sm text-text-muted">Belum ada notifikasi.</p>
            ) : null}
            {order.notifications.map((n) => (
              <div key={n.id} className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-xs">
                <div>
                  <div className="font-mono uppercase text-text-muted">{n.channel} · {n.template}</div>
                  <div className="text-text-subtle">{formatDateTime(n.created_at)}</div>
                </div>
                <StatusBadge variant="notification" status={n.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link href="/admin/pesanan" className="mt-6 inline-block text-sm text-text-muted hover:text-text">
        ← Kembali ke daftar pesanan
      </Link>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="contents">
      <dt className="text-text-muted">{label}</dt>
      <dd className={bold ? 'font-heading font-bold text-primary' : 'text-text'}>{value}</dd>
    </div>
  )
}
