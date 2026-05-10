import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { OrderActions } from './order-actions'
import { ReviewSection } from './review-section'
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

  // Fetch user's existing review (kalau ada) — RLS izinkan SELECT dgn is_visible=true
  let existingReview: { rating: number; comment: string | null; created_at: string } | null = null
  if (order.status === 'confirmed' && session?.user.id) {
    const { data: reviewRow } = await supabase
      .from('product_reviews')
      .select('rating, comment, created_at')
      .eq('order_id', order.id)
      .eq('user_id', session.user.id)
      .maybeSingle()
    existingReview = reviewRow ?? null
  }

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <DashboardTabs active="/dashboard/pesanan" />

      <div className="max-w-3xl">

      <Link
        href="/dashboard/pesanan"
        className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-ink-muted hover:text-brand-700"
      >
        <ArrowLeft size={14} strokeWidth={2.5} />
        Kembali ke daftar pesanan
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-sm text-ink-muted font-medium">{order.order_number}</div>
          <h1 className="mt-1 font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight leading-tight">
            {order.product.name}
          </h1>
        </div>
        <div className="shrink-0">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Product preview */}
      <div className="mt-6 rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] flex items-center gap-4">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 border-black/15 bg-brand-50">
          {order.product.thumbnail_url ? (
            <Image
              src={order.product.thumbnail_url}
              alt={order.product.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-ink truncate">{order.product.name}</div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-muted font-medium">
            <span>Durasi {order.product.duration_days} hari</span>
            <span>·</span>
            <span>
              {order.product.guarantee_days > 0
                ? `Garansi ${order.product.guarantee_days} hari`
                : 'Tanpa garansi'}
            </span>
          </div>
        </div>
      </div>

      {/* Order actions (credentials + claim) */}
      <OrderActions order={order} jwt={session?.access_token ?? null} />

      {/* Review section — hanya muncul kalau status confirmed (= sudah dikonfirmasi) */}
      {order.status === 'confirmed' ? (
        <ReviewSection orderId={order.id} existingReview={existingReview} />
      ) : null}

      {/* Order summary */}
      <div className="mt-6 rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <h2 className="font-heading text-xl md:text-2xl font-extrabold text-ink tracking-tight">
          Ringkasan Pesanan
        </h2>
        <dl className="mt-5 space-y-3 text-[15px]">
          <Row label="Harga produk" value={formatRupiah(order.amount_idr)} />
          {order.discount_idr > 0 ? (
            <Row
              label={`Diskon ${order.coupon_code ?? ''}`.trim()}
              value={`-${formatRupiah(order.discount_idr)}`}
              positive
            />
          ) : null}
          {order.credit_used_idr > 0 ? (
            <Row label="Kredit dipakai" value={`-${formatRupiah(order.credit_used_idr)}`} positive />
          ) : null}
          <hr className="border-black/10 border-dashed" />
          <Row label="Total dibayar" value={formatRupiah(order.total_idr)} bold />
          <Row label="Metode pembayaran" value={order.payment_method ?? '—'} />
          <Row label="Dibuat" value={formatDateTime(order.created_at)} />
          {order.delivered_at ? <Row label="Terkirim" value={formatDateTime(order.delivered_at)} /> : null}
          {order.guarantee_expires_at ? (
            <Row label="Garansi sampai" value={formatDateTime(order.guarantee_expires_at)} />
          ) : null}
        </dl>

        {order.status === 'pending_payment' && order.payment_url ? (
          <a
            href={order.payment_url}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-400 text-ink font-extrabold px-6 py-3 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
          >
            Lanjutkan Pembayaran
            <ExternalLink size={14} strokeWidth={2.5} />
          </a>
        ) : null}
      </div>

      {!['delivered', 'confirmed'].includes(order.status) ? (
        <p className="mt-5 text-center text-sm text-ink-muted font-medium">
          Akun akan ditampilkan di sini setelah pembayaran dikonfirmasi.
        </p>
      ) : null}
      </div>
    </section>
  )
}

function Row({
  label,
  value,
  bold,
  positive,
}: {
  label: string
  value: string
  bold?: boolean
  positive?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-muted font-medium">{label}</dt>
      <dd
        className={
          bold
            ? 'font-heading font-extrabold text-ink text-lg'
            : positive
              ? 'text-success font-bold'
              : 'text-ink font-bold'
        }
      >
        {value}
      </dd>
    </div>
  )
}
