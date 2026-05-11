import Image from 'next/image'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, ShoppingBag, Wallet, Target, DollarSign } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDate } from '@/lib/utils'

type Overview = {
  current: { revenue: number; orders: number; profit: number; margin: number; orders_tracked: number }
  previous: { revenue: number; orders: number; profit: number; margin: number; orders_tracked: number }
  growth: { revenue_pct: number; orders_pct: number; profit_pct: number; aov_pct: number }
  aov: number
  aov_prev: number
}

type DailyPoint = { date: string; revenue: number; profit: number; orders: number }
type StatusBreakdown = Record<string, number>
type TopProduct = { id: string; name: string; sold_count: number; price: number; thumbnail_url: string | null }

type Props = {
  searchParams: Promise<{ days?: string }>
}

export const metadata = { title: 'Admin — Analytics' }

const PERIOD_OPTIONS = [
  { value: 7, label: '7 hari' },
  { value: 30, label: '30 hari' },
  { value: 90, label: '90 hari' },
  { value: 365, label: '1 tahun' },
]

export default async function AdminAnalyticsPage({ searchParams }: Props) {
  const sp = await searchParams
  const days = Math.min(365, Math.max(1, parseInt(sp.days ?? '30', 10) || 30))

  const [overview, profitTrend, statusBreakdown, top] = await Promise.all([
    adminFetch<Overview>(`/admin/analytics/overview?days=${days}`),
    adminFetch<DailyPoint[]>(`/admin/analytics/profit-trend?days=${days}`),
    adminFetch<StatusBreakdown>(`/admin/analytics/status-breakdown?days=${days}`),
    adminFetch<TopProduct[]>(`/admin/analytics/top-products?limit=10`),
  ])

  const trend = profitTrend ?? []
  const maxRev = Math.max(...trend.map((r) => r.revenue), 1)
  const maxProfit = Math.max(...trend.map((r) => r.profit), 1)
  const chartScale = Math.max(maxRev, maxProfit, 1)

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title="Analytics"
        subtitle={`${days} hari terakhir · vs ${days} hari sebelumnya`}
        rightSlot={
          <div className="flex flex-wrap gap-1.5">
            {PERIOD_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/admin/analytics?days=${opt.value}`}
                className={`rounded-md border-2 px-3 py-1.5 text-xs font-bold transition-colors ${
                  days === opt.value
                    ? 'border-black bg-brand-500 text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)]'
                    : 'border-black/15 bg-white text-ink-muted hover:border-brand-400 hover:text-brand-700'
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <KpiStat
          icon={<DollarSign size={18} strokeWidth={2.25} />}
          label="Revenue"
          value={formatRupiah(overview?.current.revenue ?? 0)}
          growth={overview?.growth.revenue_pct ?? 0}
        />
        <KpiStat
          icon={<ShoppingBag size={18} strokeWidth={2.25} />}
          label="Total Pesanan"
          value={(overview?.current.orders ?? 0).toString()}
          growth={overview?.growth.orders_pct ?? 0}
        />
        <KpiStat
          icon={<Target size={18} strokeWidth={2.25} />}
          label="Avg Order Value"
          value={formatRupiah(overview?.aov ?? 0)}
          growth={overview?.growth.aov_pct ?? 0}
        />
        <KpiStat
          icon={<Wallet size={18} strokeWidth={2.25} />}
          label="Profit"
          value={formatRupiah(overview?.current.profit ?? 0)}
          subLabel={`${overview?.current.margin ?? 0}% margin · ${overview?.current.orders_tracked ?? 0} tracked`}
          growth={overview?.growth.profit_pct ?? 0}
        />
      </div>

      {/* Revenue + Profit chart */}
      <div className="mt-6 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Revenue vs Profit Harian</h2>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-brand-500 border border-black" aria-hidden="true" /> Revenue
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-success border border-black" aria-hidden="true" /> Profit
            </span>
          </div>
        </div>
        {trend.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink-muted">
            Belum ada data revenue di periode ini. Order yang sudah dibayar akan tampil di sini.
          </div>
        ) : (
          <>
            <div className="flex h-56 items-end gap-0.5">
              {trend.map((r) => {
                const revPct = (r.revenue / chartScale) * 100
                const profitPct = (r.profit / chartScale) * 100
                return (
                  <div key={r.date} className="group relative flex-1 flex items-end gap-0.5" title={`${formatDate(r.date)}\nRevenue: ${formatRupiah(r.revenue)}\nProfit: ${formatRupiah(r.profit)}\nOrders: ${r.orders}`}>
                    <div className="flex-1 bg-brand-300 hover:bg-brand-500 transition-colors rounded-t-sm" style={{ height: `${revPct}%` }} />
                    <div className="flex-1 bg-success/70 hover:bg-success transition-colors rounded-t-sm" style={{ height: `${profitPct}%` }} />
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink-subtle">
              <span>{trend[0] ? formatDate(trend[0].date) : '—'}</span>
              <span className="text-[10px] font-bold">Hover bar untuk detail</span>
              <span>{trend[trend.length - 1] ? formatDate(trend[trend.length - 1].date) : '—'}</span>
            </div>
          </>
        )}
      </div>

      {/* Funnel + Status breakdown + Top products */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <FunnelBreakdown breakdown={statusBreakdown ?? {}} />
        <TopProductsList products={top ?? []} />
      </div>
    </div>
  )
}

function KpiStat({
  icon, label, value, subLabel, growth,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subLabel?: string
  growth: number
}) {
  const tone = growth > 0 ? 'text-success' : growth < 0 ? 'text-danger' : 'text-ink-muted'
  const TrendIcon = growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : Minus
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted font-bold">
          <span className="text-brand-600">{icon}</span>
          {label}
        </span>
        <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold ${tone}`}>
          <TrendIcon size={12} strokeWidth={2.5} />
          {growth > 0 ? '+' : ''}{growth}%
        </span>
      </div>
      <div className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-ink tabular-nums">{value}</div>
      {subLabel ? <div className="text-[10px] text-ink-subtle font-medium mt-0.5">{subLabel}</div> : null}
    </div>
  )
}

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pending_payment: { label: 'Menunggu Bayar', tone: 'bg-warning text-ink' },
  paid: { label: 'Dibayar (queue)', tone: 'bg-brand-500 text-ink' },
  delivered: { label: 'Terkirim', tone: 'bg-success text-white' },
  confirmed: { label: 'Selesai', tone: 'bg-success text-white' },
  refunded: { label: 'Refunded', tone: 'bg-danger text-white' },
  expired: { label: 'Expired', tone: 'bg-gray-400 text-white' },
  delivery_failed: { label: 'Gagal Kirim', tone: 'bg-danger text-white' },
}

function FunnelBreakdown({ breakdown }: { breakdown: StatusBreakdown }) {
  const total = Object.values(breakdown).reduce((s, n) => s + n, 0)
  // Funnel main flow: pending_payment → paid → delivered → confirmed
  const funnel = [
    { key: 'pending_payment', cumulative: breakdown.pending_payment + breakdown.paid + breakdown.delivered + breakdown.confirmed + breakdown.refunded + breakdown.delivery_failed },
    { key: 'paid', cumulative: breakdown.paid + breakdown.delivered + breakdown.confirmed + breakdown.refunded + breakdown.delivery_failed },
    { key: 'delivered', cumulative: breakdown.delivered + breakdown.confirmed + breakdown.refunded },
    { key: 'confirmed', cumulative: breakdown.confirmed },
  ]
  const maxF = Math.max(funnel[0].cumulative, 1)

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <h2 className="font-heading text-xl font-extrabold tracking-tight">Conversion Funnel</h2>
      <p className="mt-1 text-xs text-ink-muted">Drop-off tiap tahap order. Total {total} order di periode ini.</p>

      {total === 0 ? (
        <p className="mt-6 text-sm text-ink-muted text-center py-6">Belum ada order untuk dianalisis.</p>
      ) : (
        <>
          <div className="mt-5 space-y-2">
            {funnel.map((f, i) => {
              const cfg = STATUS_LABELS[f.key]
              const pct = Math.round((f.cumulative / maxF) * 100)
              const dropFromPrev = i > 0 && funnel[i - 1].cumulative > 0
                ? Math.round(((funnel[i - 1].cumulative - f.cumulative) / funnel[i - 1].cumulative) * 100)
                : 0
              return (
                <div key={f.key} className="space-y-0.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-ink">{cfg.label}</span>
                    <span className="tabular-nums">
                      <strong className="text-ink">{f.cumulative}</strong>
                      {i > 0 && dropFromPrev > 0 ? <span className="text-danger ml-1.5">-{dropFromPrev}%</span> : null}
                    </span>
                  </div>
                  <div className="h-7 rounded-md border-2 border-black overflow-hidden bg-white">
                    <div className={`h-full ${cfg.tone}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Side breakdowns: refunded, expired */}
          <div className="mt-5 pt-4 border-t border-black/10">
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Other Outcomes</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <SideStat label="Refunded" count={breakdown.refunded} total={total} />
              <SideStat label="Expired" count={breakdown.expired} total={total} />
              <SideStat label="Gagal Kirim" count={breakdown.delivery_failed} total={total} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SideStat({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="rounded-lg border border-black/10 bg-brand-50/40 p-2.5">
      <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="font-heading font-extrabold text-base text-ink tabular-nums">{count}</span>
        <span className="text-[10px] text-ink-subtle">({pct}%)</span>
      </div>
    </div>
  )
}

function TopProductsList({ products }: { products: TopProduct[] }) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <h2 className="font-heading text-xl font-extrabold tracking-tight">Top 10 Produk</h2>
      <p className="mt-1 text-xs text-ink-muted">Berdasarkan total terjual sepanjang waktu (sold_count).</p>
      <div className="mt-4 space-y-2">
        {products.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-6">Belum ada data terjual.</p>
        ) : (
          products.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-black/10 bg-brand-50/40 p-2.5">
              <span className="font-mono text-xs font-bold text-ink-subtle w-6">#{i + 1}</span>
              {p.thumbnail_url ? (
                <Image
                  src={p.thumbnail_url}
                  alt={p.name}
                  width={40}
                  height={40}
                  className="rounded-md border-2 border-black/10 object-cover shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-10 h-10 rounded-md border-2 border-dashed border-black/15 bg-brand-50 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-ink truncate">{p.name}</div>
                <div className="text-xs text-ink-subtle">{p.sold_count.toLocaleString('id-ID')} terjual</div>
              </div>
              <span className="font-heading font-bold text-sm text-brand-700 tabular-nums whitespace-nowrap">{formatRupiah(p.price)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
