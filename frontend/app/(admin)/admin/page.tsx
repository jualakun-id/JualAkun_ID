import Link from 'next/link'
import {
  DollarSign, TrendingUp, Wallet, ShoppingBag, Users, LifeBuoy, Coins,
  AlertTriangle, Clock, Package, Tag, BarChart3, ArrowRight,
  CheckCircle2, RotateCcw, UserPlus, Activity, ShoppingCart, Star,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Kpis = {
  revenue: { today: number; this_month: number; last_month: number }
  orders: { pending_payment: number; paid: number; delivery_failed: number; today_total: number }
  users: { total: number; new_today: number; new_this_week: number }
  stock: { critical: number; out: number }
  tickets: { open: number }
}

type ProfitPeriod = {
  orders_tracked: number
  orders_untracked: number
  revenue_idr: number
  cost_idr: number
  profit_idr: number
  margin_pct: number
}
type ProfitKpis = { today: ProfitPeriod; this_month: ProfitPeriod }

type ActionCenter = {
  paid_orders: { total: number; sla_breach_2h: number; sla_breach_24h: number }
  open_tickets: { total: number; sla_breach_24h: number; sla_breach_48h: number }
  stock: { out: number; critical: number }
}

type Overview = {
  current: { revenue: number; orders: number; profit: number; margin: number; orders_tracked: number }
  growth: { revenue_pct: number; orders_pct: number; profit_pct: number; aov_pct: number }
  aov: number
}

type DailyPoint = { date: string; revenue: number; profit: number; orders: number }
type SupplierBalance = { balance_usd: number; balance_text: string; balance_idr: number; exchange_rate: number } | null
type ActivityEvent = { id: string; event_type: string; ref_id: string | null; ref_table: string | null; title: string; created_at: string }
type SLAMetrics = { total: number; avg_minutes: number; bucket_pct: { under_1h: number; '1_to_6h': number; '6_to_24h': number; over_24h: number } }

export const metadata = { title: 'Admin Dashboard' }

const EVENT_ICONS: Record<string, typeof UserPlus> = {
  user_registered: UserPlus,
  order_created: ShoppingCart,
  order_paid: Wallet,
  order_delivered: CheckCircle2,
  order_refunded: RotateCcw,
  ticket_created: LifeBuoy,
  ticket_resolved: CheckCircle2,
  coupon_used: Tag,
  review_submitted: Star,
  supplier_purchase: ShoppingCart,
}

function getEventLink(e: ActivityEvent): string | null {
  if (!e.ref_id) return null
  if (e.ref_table === 'orders') return `/admin/pesanan/${e.ref_id}`
  if (e.ref_table === 'support_tickets') return `/admin/tiket/${e.ref_id}`
  if (e.ref_table === 'profiles') return `/admin/pengguna`
  if (e.ref_table === 'coupons') return `/admin/kupon/${e.ref_id}`
  if (e.ref_table === 'products') return `/admin/produk`
  return null
}

export default async function AdminDashboardPage() {
  const [kpis, profit, actionCenter, overview7d, profitTrend, supplierBalance, activityList, sla] = await Promise.all([
    adminFetch<Kpis>('/admin/analytics/dashboard'),
    adminFetch<ProfitKpis>('/admin/analytics/profit'),
    adminFetch<ActionCenter>('/admin/analytics/action-center'),
    adminFetch<Overview>('/admin/analytics/overview?days=7'),
    adminFetch<DailyPoint[]>('/admin/analytics/profit-trend?days=7'),
    adminFetch<SupplierBalance>('/admin/supplier/balance'),
    adminFetch<{ logs: ActivityEvent[] }>('/admin/activity-log?limit=8'),
    adminFetch<SLAMetrics>('/admin/analytics/sla?days=7'),
  ])

  const ac = actionCenter
  const recentEvents = activityList?.logs ?? []
  const slaUnder1h = sla?.bucket_pct.under_1h ?? 0
  const slaHealthy = slaUnder1h >= 70

  // Compute action items by urgency
  const criticalItems: ActionCardProps[] = []
  const warningItems: ActionCardProps[] = []

  if ((ac?.paid_orders.sla_breach_24h ?? 0) > 0) {
    criticalItems.push({
      icon: <Clock size={16} strokeWidth={2.5} />,
      title: `${ac!.paid_orders.sla_breach_24h} order paid > 24 jam`,
      desc: 'Belum di-fulfill, buyer menunggu lama',
      href: '/admin/pesanan?status=paid',
      tone: 'danger',
    })
  }
  if ((ac?.open_tickets.sla_breach_48h ?? 0) > 0) {
    criticalItems.push({
      icon: <AlertTriangle size={16} strokeWidth={2.5} />,
      title: `${ac!.open_tickets.sla_breach_48h} tiket open > 48 jam`,
      desc: 'Buyer butuh respon segera',
      href: '/admin/tiket?status=open',
      tone: 'danger',
    })
  }
  if ((ac?.stock.out ?? 0) > 0) {
    criticalItems.push({
      icon: <Package size={16} strokeWidth={2.5} />,
      title: `${ac!.stock.out} produk stok 0`,
      desc: 'Update display_stock atau pre-sync supplier',
      href: '/admin/stok-monitor?filter=out',
      tone: 'danger',
    })
  }
  if (supplierBalance && supplierBalance.balance_usd < 2) {
    criticalItems.push({
      icon: <Wallet size={16} strokeWidth={2.5} />,
      title: `Saldo Canboso ${supplierBalance.balance_text}`,
      desc: 'Top-up biar order tidak stuck',
      href: '/admin/stok-monitor',
      tone: 'danger',
    })
  }

  if ((ac?.paid_orders.sla_breach_2h ?? 0) > (ac?.paid_orders.sla_breach_24h ?? 0)) {
    const count = (ac!.paid_orders.sla_breach_2h - ac!.paid_orders.sla_breach_24h)
    warningItems.push({
      icon: <Clock size={16} strokeWidth={2.5} />,
      title: `${count} order paid 2-24 jam`,
      desc: 'Pertimbangkan fulfill sekarang',
      href: '/admin/pesanan?status=paid',
      tone: 'warning',
    })
  }
  if ((ac?.open_tickets.sla_breach_24h ?? 0) > (ac?.open_tickets.sla_breach_48h ?? 0)) {
    const count = (ac!.open_tickets.sla_breach_24h - ac!.open_tickets.sla_breach_48h)
    warningItems.push({
      icon: <LifeBuoy size={16} strokeWidth={2.5} />,
      title: `${count} tiket open 24-48 jam`,
      desc: 'Respond sebelum eskalasi',
      href: '/admin/tiket?status=open',
      tone: 'warning',
    })
  }
  if ((ac?.stock.critical ?? 0) > 0) {
    warningItems.push({
      icon: <Package size={16} strokeWidth={2.5} />,
      title: `${ac!.stock.critical} produk stok kritis`,
      desc: 'Stok ≤ 5 unit',
      href: '/admin/stok-monitor?filter=critical',
      tone: 'warning',
    })
  }
  if (supplierBalance && supplierBalance.balance_usd >= 2 && supplierBalance.balance_usd < 10) {
    warningItems.push({
      icon: <Wallet size={16} strokeWidth={2.5} />,
      title: `Saldo Canboso ${supplierBalance.balance_text}`,
      desc: 'Mulai siap-siap top-up',
      href: '/admin/stok-monitor',
      tone: 'warning',
    })
  }

  const allClear = criticalItems.length === 0 && warningItems.length === 0
  const totalActionable = criticalItems.length + warningItems.length

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title="Dashboard"
        subtitle={
          allClear
            ? '✓ Semua sehat — tidak ada aksi mendesak'
            : `${totalActionable} item perlu attention · ${criticalItems.length} kritis`
        }
      />

      {/* ── ACTION CENTER ──────────────────────────────────────── */}
      <section className="mt-6">
        {allClear ? (
          <AllClearBanner />
        ) : (
          <div className="space-y-3">
            {criticalItems.length > 0 ? (
              <ActionGroup tone="danger" title={`🔴 Kritis (${criticalItems.length})`} items={criticalItems} />
            ) : null}
            {warningItems.length > 0 ? (
              <ActionGroup tone="warning" title={`🟡 Warning (${warningItems.length})`} items={warningItems} />
            ) : null}
          </div>
        )}
      </section>

      {/* ── MONEY KPIs (today + month + 7d growth) ─────────────── */}
      <section className="mt-6">
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-ink mb-3 inline-flex items-center gap-2">
          <DollarSign size={18} strokeWidth={2.25} className="text-brand-600" />
          Performance
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MoneyKpi
            label="Revenue Hari Ini"
            value={formatRupiah(kpis?.revenue.today ?? 0)}
            sub={`${kpis?.orders.today_total ?? 0} order`}
            icon={<DollarSign size={18} strokeWidth={2.25} />}
          />
          <MoneyKpi
            label="Profit Hari Ini"
            value={formatRupiah(profit?.today.profit_idr ?? 0)}
            sub={`${profit?.today.margin_pct ?? 0}% margin · ${profit?.today.orders_tracked ?? 0} tracked`}
            icon={<TrendingUp size={18} strokeWidth={2.25} />}
          />
          <MoneyKpi
            label="Profit Bulan Ini"
            value={formatRupiah(profit?.this_month.profit_idr ?? 0)}
            sub={`${profit?.this_month.margin_pct ?? 0}% margin · ${profit?.this_month.orders_tracked ?? 0} tracked`}
            icon={<Wallet size={18} strokeWidth={2.25} />}
          />
          <MoneyKpi
            label="Revenue 7 Hari"
            value={formatRupiah(overview7d?.current.revenue ?? 0)}
            sub={`Growth ${overview7d?.growth.revenue_pct ?? 0}% vs minggu lalu`}
            growth={overview7d?.growth.revenue_pct}
            icon={<BarChart3 size={18} strokeWidth={2.25} />}
          />
        </div>
      </section>

      {/* ── OPERATIONAL STATUS ─────────────────────────────────── */}
      <section className="mt-6">
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-ink mb-3 inline-flex items-center gap-2">
          <Activity size={18} strokeWidth={2.25} className="text-brand-600" />
          Status Operasional
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OpsStat
            label="Pesanan Menunggu"
            value={ac?.paid_orders.total ?? 0}
            sub={`${ac?.paid_orders.sla_breach_2h ?? 0} > 2 jam`}
            href="/admin/pesanan?status=paid"
            tone={(ac?.paid_orders.sla_breach_24h ?? 0) > 0 ? 'danger' : (ac?.paid_orders.sla_breach_2h ?? 0) > 0 ? 'warning' : 'success'}
          />
          <OpsStat
            label="Tiket Open"
            value={ac?.open_tickets.total ?? 0}
            sub={`${ac?.open_tickets.sla_breach_24h ?? 0} > 24 jam`}
            href="/admin/tiket?status=open"
            tone={(ac?.open_tickets.sla_breach_48h ?? 0) > 0 ? 'danger' : (ac?.open_tickets.sla_breach_24h ?? 0) > 0 ? 'warning' : 'success'}
          />
          <OpsStat
            label="Saldo Supplier"
            value={supplierBalance?.balance_text ?? '—'}
            sub={supplierBalance ? `≈ ${formatRupiah(supplierBalance.balance_idr)}` : 'tidak tersedia'}
            href="/admin/stok-monitor"
            tone={!supplierBalance ? 'muted' : supplierBalance.balance_usd < 2 ? 'danger' : supplierBalance.balance_usd < 10 ? 'warning' : 'success'}
          />
          <OpsStat
            label="SLA Fulfillment 7d"
            value={sla?.total ? `${slaUnder1h}%` : '—'}
            sub={sla?.total ? `< 1 jam · ${sla.total} order` : 'belum ada data'}
            href="/admin/analytics"
            tone={!sla?.total ? 'muted' : slaHealthy ? 'success' : 'warning'}
          />
        </div>
      </section>

      {/* ── MINI CHART + ACTIVITY FEED ─────────────────────────── */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <MiniRevenueChart trend={profitTrend ?? []} />
        <RecentActivityFeed events={recentEvents} />
      </section>

      {/* ── QUICK ACTIONS GRID ─────────────────────────────────── */}
      <section className="mt-6">
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-ink mb-3 inline-flex items-center gap-2">
          <ArrowRight size={18} strokeWidth={2.25} className="text-brand-600" />
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <QuickActionLink icon={<ShoppingBag size={20} strokeWidth={2.25} />} label="Pesanan" desc="Manage order + fulfill" href="/admin/pesanan?status=paid" badge={ac?.paid_orders.total ?? 0} />
          <QuickActionLink icon={<Package size={20} strokeWidth={2.25} />} label="Produk" desc="Kelola katalog + diskon" href="/admin/produk" />
          <QuickActionLink icon={<LifeBuoy size={20} strokeWidth={2.25} />} label="Tiket" desc="Klaim garansi buyer" href="/admin/tiket?status=open" badge={ac?.open_tickets.total ?? 0} />
          <QuickActionLink icon={<Tag size={20} strokeWidth={2.25} />} label="Kupon" desc="Promo + diskon" href="/admin/kupon?status=active" />
          <QuickActionLink icon={<Users size={20} strokeWidth={2.25} />} label="Pengguna" desc="Buyer + admin" href="/admin/pengguna?role=user" badge={kpis?.users.new_today ?? 0} badgeLabel="baru" />
          <QuickActionLink icon={<Coins size={20} strokeWidth={2.25} />} label="Stok Monitor" desc="Sync supplier + alert" href="/admin/stok-monitor" badge={(ac?.stock.out ?? 0) + (ac?.stock.critical ?? 0)} />
        </div>
      </section>
    </div>
  )
}

// ============ Components ============

type Tone = 'success' | 'warning' | 'danger' | 'muted'

function toneClass(tone: Tone): string {
  switch (tone) {
    case 'success': return 'bg-success/10 border-success/40 text-success'
    case 'warning': return 'bg-warning/10 border-warning/50 text-warning'
    case 'danger': return 'bg-danger/10 border-danger/40 text-danger'
    default: return 'bg-gray-100 border-gray-300 text-ink-muted'
  }
}

type ActionCardProps = {
  icon: React.ReactNode
  title: string
  desc: string
  href: string
  tone: 'danger' | 'warning'
}

function ActionGroup({ tone, title, items }: { tone: 'danger' | 'warning'; title: string; items: ActionCardProps[] }) {
  const ring = tone === 'danger' ? 'border-danger/40 bg-danger/5' : 'border-warning/50 bg-warning/5'
  return (
    <div className={`rounded-2xl border-2 border-black p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] bg-white`}>
      <div className={`-mx-5 -mt-5 mb-4 px-5 py-2.5 border-b-2 border-black ${ring}`}>
        <span className="font-heading font-extrabold text-sm tracking-tight">{title}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className={`group flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 hover:-translate-y-0.5 transition-all ${toneClass(item.tone)}`}
          >
            <span className="shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm leading-tight">{item.title}</div>
              <div className="text-[11px] opacity-80 mt-0.5 leading-tight">{item.desc}</div>
            </div>
            <ArrowRight size={14} strokeWidth={2.5} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function AllClearBanner() {
  return (
    <div className="rounded-2xl border-2 border-black bg-success/10 p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] text-center">
      <div className="font-heading text-xl font-extrabold text-success tracking-tight">✓ Semua Sehat</div>
      <p className="mt-1 text-sm text-ink-muted">
        Tidak ada order pending fulfill, tiket open, atau stok kritis. Saatnya planning strategis atau ngopi ☕
      </p>
    </div>
  )
}

function MoneyKpi({
  icon, label, value, sub, growth,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; growth?: number
}) {
  const growthTone = growth === undefined ? '' : growth > 0 ? 'text-success' : growth < 0 ? 'text-danger' : 'text-ink-muted'
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted">
          <span className="text-brand-600">{icon}</span>
          {label}
        </span>
        {growth !== undefined ? (
          <span className={`text-xs font-extrabold ${growthTone}`}>
            {growth > 0 ? '+' : ''}{growth}%
          </span>
        ) : null}
      </div>
      <div className="mt-2 font-heading text-xl font-extrabold tracking-tight text-ink tabular-nums">{value}</div>
      {sub ? <div className="text-[10px] text-ink-subtle font-medium mt-0.5">{sub}</div> : null}
    </div>
  )
}

function OpsStat({
  label, value, sub, href, tone,
}: {
  label: string; value: number | string; sub: string; href: string; tone: Tone
}) {
  const valTone = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : tone === 'danger' ? 'text-danger' : 'text-ink'
  return (
    <Link
      href={href}
      className="group rounded-2xl border-2 border-black bg-white p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-150"
    >
      <div className="text-xs font-bold text-ink-muted">{label}</div>
      <div className={`mt-1.5 font-heading text-2xl font-extrabold tracking-tight tabular-nums ${valTone}`}>{value}</div>
      <div className="mt-0.5 flex items-center justify-between text-[10px] text-ink-subtle font-medium">
        <span>{sub}</span>
        <ArrowRight size={11} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  )
}

function MiniRevenueChart({ trend }: { trend: DailyPoint[] }) {
  const maxRev = Math.max(...trend.map((r) => r.revenue), 1)
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-base font-extrabold tracking-tight inline-flex items-center gap-2">
          <BarChart3 size={16} strokeWidth={2.25} className="text-brand-600" />
          Revenue 7 Hari
        </h3>
        <Link href="/admin/analytics" className="text-xs font-bold text-ink-muted hover:text-brand-700 inline-flex items-center gap-1">
          Detail analytics <ArrowRight size={11} strokeWidth={2.5} />
        </Link>
      </div>
      {trend.length === 0 ? (
        <div className="py-10 text-center text-sm text-ink-muted">Belum ada data revenue 7 hari terakhir.</div>
      ) : (
        <>
          <div className="flex h-24 items-end gap-1">
            {trend.map((r) => (
              <div
                key={r.date}
                className="group relative flex-1 rounded-t-sm bg-brand-300 hover:bg-brand-500 transition-colors"
                style={{ height: `${(r.revenue / maxRev) * 100}%` }}
                title={`${r.date}: ${formatRupiah(r.revenue)} · ${r.orders} order`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-ink-subtle font-medium">
            {trend.slice(0, 1).map((r) => <span key={r.date}>{r.date}</span>)}
            <span>Hover untuk detail</span>
            {trend.slice(-1).map((r) => <span key={r.date}>{r.date}</span>)}
          </div>
        </>
      )}
    </div>
  )
}

function RecentActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-base font-extrabold tracking-tight inline-flex items-center gap-2">
          <Activity size={16} strokeWidth={2.25} className="text-brand-600" />
          Aktivitas Terbaru
        </h3>
        <Link href="/admin/notifikasi" className="text-xs font-bold text-ink-muted hover:text-brand-700 inline-flex items-center gap-1">
          Lihat semua <ArrowRight size={11} strokeWidth={2.5} />
        </Link>
      </div>
      {events.length === 0 ? (
        <div className="py-8 text-center text-sm text-ink-muted">Belum ada aktivitas.</div>
      ) : (
        <ol className="space-y-2">
          {events.slice(0, 6).map((e) => {
            const Icon = EVENT_ICONS[e.event_type] ?? Activity
            const href = getEventLink(e)
            const content = (
              <div className="flex items-start gap-2.5">
                <div className="shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 border border-brand-200 text-brand-600">
                  <Icon size={11} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-ink leading-snug line-clamp-1">{e.title}</div>
                  <div className="text-[10px] text-ink-subtle">{formatDateTime(e.created_at)}</div>
                </div>
              </div>
            )
            return (
              <li key={e.id}>
                {href ? (
                  <Link href={href} className="block rounded-md hover:bg-brand-50/40 p-1 -m-1 transition-colors">
                    {content}
                  </Link>
                ) : (
                  <div className="p-1 -m-1">{content}</div>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

function QuickActionLink({
  icon, label, desc, href, badge, badgeLabel,
}: {
  icon: React.ReactNode; label: string; desc: string; href: string; badge?: number; badgeLabel?: string
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-2xl border-2 border-black bg-white p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-150"
    >
      {badge !== undefined && badge > 0 ? (
        <span className="absolute -top-2 -right-2 inline-flex items-center gap-0.5 rounded-full bg-brand-500 border-2 border-black px-2 py-0.5 text-[10px] font-extrabold text-ink shadow-[0_1px_0_rgba(0,0,0,0.9)]">
          {badge}{badgeLabel ? ` ${badgeLabel}` : ''}
        </span>
      ) : null}
      <div className="text-brand-600 mb-1.5 group-hover:text-brand-700 transition-colors">{icon}</div>
      <div className="font-heading text-base font-extrabold text-ink tracking-tight">{label}</div>
      <div className="mt-0.5 text-[11px] text-ink-muted font-medium leading-tight">{desc}</div>
    </Link>
  )
}
