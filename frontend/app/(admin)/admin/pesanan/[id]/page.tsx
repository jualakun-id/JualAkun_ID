import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { OrderActions } from './order-actions'
import { FulfillForm } from './fulfill-form'
import { OrderTimeline } from './order-timeline'
import { CredentialsPanel } from './credentials-panel'
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
  payment_unique_suffix?: number | null
  payment_claimed_at?: string | null
  payment_verified_at?: string | null
  payment_rejected_reason?: string | null
  paid_at: string | null
  delivered_at: string | null
  buyer_confirmed_at?: string | null
  account_stock_id?: string | null
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

          {/* Verifying banner — admin instructions */}
          {order.status === 'verifying' ? (
            <div className="mt-5 rounded-xl border-2 border-amber-400 bg-amber-50 p-4 shadow-[0_2px_0_rgba(0,0,0,0.9)]">
              <div className="font-extrabold text-ink text-sm flex items-center gap-2">
                ⏳ Buyer Klaim Sudah Bayar — Perlu Verifikasi
              </div>
              <div className="mt-2 text-sm text-ink-muted space-y-1">
                <div>
                  Expected: <strong className="text-ink text-base">{formatRupiah(order.total_idr)}</strong>
                  {order.payment_unique_suffix !== null && order.payment_unique_suffix !== undefined ? (
                    <span className="ml-1.5 text-xs text-amber-700 font-bold">
                      (suffix: {String(order.payment_unique_suffix).padStart(3, '0')})
                    </span>
                  ) : null}
                </div>
                {order.payment_claimed_at ? (
                  <div className="text-xs">Diklaim: {formatDateTime(order.payment_claimed_at)}</div>
                ) : null}
              </div>
              <ol className="mt-3 text-[13px] text-ink-muted space-y-1 list-decimal list-inside">
                <li>Buka app <strong>GoPay Saya</strong> → Mutasi</li>
                <li>Cari masuk dengan nominal <strong>{formatRupiah(order.total_idr)}</strong></li>
                <li>Klik <strong>Konfirmasi</strong> kalau cocok, atau <strong>Reject</strong> kalau tidak nemu</li>
              </ol>
            </div>
          ) : null}

          {/* Rejected reason banner */}
          {order.status === 'cancelled' && order.payment_rejected_reason ? (
            <div className="mt-5 rounded-xl border-2 border-danger bg-danger/5 p-4 shadow-[0_2px_0_rgba(0,0,0,0.9)]">
              <div className="font-extrabold text-danger text-sm">Pembayaran di-reject</div>
              <p className="mt-1 text-sm text-ink">Alasan: {order.payment_rejected_reason}</p>
            </div>
          ) : null}

          {['paid', 'delivery_failed'].includes(order.status) ? (
            <FulfillForm
              orderId={id}
              productName={order.product?.name ?? 'Akun Digital'}
              hasSupplier={!!order.product?.supplier_product_id}
            />
          ) : null}

          <OrderActions
            orderId={id}
            status={order.status}
            totalIdr={order.total_idr}
            uniqueSuffix={order.payment_unique_suffix ?? null}
          />
        </div>

        <div className="space-y-4">
          {/* Timeline progres pesanan — replace Log Notifikasi */}
          <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
            <OrderTimeline
              status={order.status}
              createdAt={order.created_at}
              paymentClaimedAt={order.payment_claimed_at}
              paymentVerifiedAt={order.payment_verified_at}
              paidAt={order.paid_at}
              deliveredAt={order.delivered_at}
              buyerConfirmedAt={order.buyer_confirmed_at}
              paymentRejectedReason={order.payment_rejected_reason}
              expiresAt={order.expires_at}
            />
          </div>

          {/* Panel credentials — admin bisa lihat + edit credentials yang
              sudah dikirim ke buyer, terpisah dari ticket flow */}
          <CredentialsPanel
            orderId={id}
            orderStatus={order.status}
            hasAccountStock={!!order.account_stock_id}
          />
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
