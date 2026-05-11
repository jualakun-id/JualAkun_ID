import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { OrderActions } from './order-actions'
import { FulfillForm } from './fulfill-form'
import { NotificationItem } from './notification-item'
import { ExpiresCountdown } from './expires-countdown'
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
  expires_at: string | null
  cost_idr: number | null
  cost_usd: number | null
  cost_source: string | null
  product: { name: string; slug: string; supplier_product_id?: string | null } | null
  buyer: { email: string | null }
  notifications: { id: string; channel: string; template: string; status: string; created_at: string }[]
}

type Props = { params: Promise<{ id: string }> }

export default async function AdminPesananDetailPage({ params }: Props) {
  const { id } = await params
  const order = await adminFetch<OrderDetail>(`/admin/orders/${id}`)
  if (!order) notFound()

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title={`Pesanan ${order.order_number}`}
        subtitle={order.product?.name ?? ''}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant="order" status={order.status} />
            {order.product?.slug ? (
              <Link
                href={`/produk/${order.product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka halaman publik produk"
                className="inline-flex items-center gap-1 rounded-md border border-black/15 bg-white px-2.5 py-1 text-xs font-bold text-ink-muted hover:border-brand-400 hover:text-brand-700"
              >
                <ExternalLink size={12} strokeWidth={2.5} />
                Lihat di publik
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Info Pesanan</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <BuyerRow email={order.buyer.email} />
            <ProductRow name={order.product?.name ?? '—'} slug={order.product?.slug} />
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
            {order.status === 'pending_payment' && order.expires_at ? (
              <div className="contents">
                <dt className="text-ink-muted">Expired Dalam</dt>
                <dd>
                  <ExpiresCountdown expiresAt={order.expires_at} />
                </dd>
              </div>
            ) : null}
            {order.cost_idr !== null ? (
              <>
                <Row
                  label="Modal"
                  value={`${formatRupiah(order.cost_idr)}${order.cost_source ? ` · ${order.cost_source === 'supplier_canboso' ? 'Canboso' : order.cost_source}` : ''}`}
                />
                <ProfitRow revenue={order.total_idr} cost={order.cost_idr} />
              </>
            ) : order.status === 'delivered' ? (
              <Row label="Modal" value="— (pre-tracking)" />
            ) : null}
          </dl>

          {['paid', 'delivery_failed'].includes(order.status) ? (
            <FulfillForm
              orderId={id}
              productName={order.product?.name ?? 'Akun Digital'}
              hasSupplier={!!order.product?.supplier_product_id}
            />
          ) : null}

          <OrderActions orderId={id} status={order.status} />
        </div>

        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Log Notifikasi</h2>
          <div className="mt-3 space-y-2">
            {order.notifications.length === 0 ? (
              <p className="text-sm text-ink-muted font-medium text-center py-6">
                Belum ada notifikasi terkirim untuk pesanan ini.
              </p>
            ) : null}
            {order.notifications.map((n) => (
              <NotificationItem key={n.id} orderId={id} notif={n} />
            ))}
          </div>
        </div>
      </div>

      <Link href="/admin/pesanan" className="mt-6 inline-block text-sm text-ink-muted hover:text-ink">
        ← Kembali ke daftar pesanan
      </Link>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="contents">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={bold ? 'font-heading font-bold text-brand-700' : 'text-ink'}>{value}</dd>
    </div>
  )
}

function BuyerRow({ email }: { email: string | null }) {
  if (!email) return <Row label="Buyer" value="—" />
  return (
    <div className="contents">
      <dt className="text-ink-muted">Buyer</dt>
      <dd>
        <Link
          href={`/admin/pengguna?search=${encodeURIComponent(email.split('@')[0])}`}
          className="text-ink hover:text-brand-700 underline underline-offset-2 decoration-dotted"
        >
          {email}
        </Link>
      </dd>
    </div>
  )
}

function ProductRow({ name, slug }: { name: string; slug?: string }) {
  if (!slug || name === '—') return <Row label="Produk" value={name} />
  return (
    <div className="contents">
      <dt className="text-ink-muted">Produk</dt>
      <dd>
        <Link
          href={`/admin/produk?search=${encodeURIComponent(slug)}`}
          className="text-ink hover:text-brand-700 underline underline-offset-2 decoration-dotted"
        >
          {name}
        </Link>
      </dd>
    </div>
  )
}

function ProfitRow({ revenue, cost }: { revenue: number; cost: number }) {
  const profit = revenue - cost
  const marginPct = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const tone =
    marginPct >= 30
      ? 'text-success'
      : marginPct >= 15
        ? 'text-warning'
        : marginPct >= 0
          ? 'text-ink-muted'
          : 'text-danger'
  return (
    <div className="contents">
      <dt className="text-ink-muted">Profit</dt>
      <dd className={`font-heading font-bold ${tone}`}>
        {formatRupiah(profit)} <span className="text-xs">({marginPct}%)</span>
      </dd>
    </div>
  )
}
