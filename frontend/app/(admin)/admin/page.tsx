import Link from 'next/link'
import { DollarSign, ShoppingBag, Users, Truck, LifeBuoy, Gift } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { HealthScore } from '@/components/admin/health-score'
import { ActionItems } from '@/components/admin/action-items'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah } from '@/lib/utils'

type Kpis = {
  revenue: { today: number; this_month: number; last_month: number }
  orders: { pending_payment: number; paid: number; delivery_failed: number; today_total: number }
  users: { total: number; new_today: number; new_this_week: number }
  stock: { critical: number; out: number }
  tickets: { open: number }
}

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const kpis = await adminFetch<Kpis>('/admin/analytics/dashboard')
  const score = computeHealthScore(kpis)

  const items = []
  if ((kpis?.orders.delivery_failed ?? 0) > 0) {
    items.push({ count: kpis!.orders.delivery_failed, label: 'pesanan gagal dikirim', href: '/admin/pesanan?status=delivery_failed', severity: 'danger' as const })
  }
  if ((kpis?.tickets.open ?? 0) > 0) {
    items.push({ count: kpis!.tickets.open, label: 'tiket open perlu direspons', href: '/admin/tiket?status=open', severity: 'warn' as const })
  }
  if ((kpis?.stock.out ?? 0) > 0) {
    items.push({ count: kpis!.stock.out, label: 'produk stok habis', href: '/admin/stok-monitor?filter=out', severity: 'danger' as const })
  }
  if ((kpis?.stock.critical ?? 0) > 0) {
    items.push({ count: kpis!.stock.critical, label: 'produk stok kritis', href: '/admin/stok-monitor?filter=critical', severity: 'warn' as const })
  }

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Dashboard" subtitle="Kesehatan platform & action items hari ini" />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <HealthScore score={score} />
        <ActionItems items={items} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={<DollarSign size={20} strokeWidth={2.25} />} label="GMV Hari Ini" value={formatRupiah(kpis?.revenue.today ?? 0)} />
        <KpiCard icon={<ShoppingBag size={20} strokeWidth={2.25} />} label="Pesanan Hari Ini" value={kpis?.orders.today_total ?? 0} />
        <KpiCard icon={<Users size={20} strokeWidth={2.25} />} label="User Baru" value={kpis?.users.new_this_week ?? 0} subLabel="7 hari terakhir" />
        <KpiCard icon={<Truck size={20} strokeWidth={2.25} />} label="Menunggu Bayar" value={kpis?.orders.pending_payment ?? 0} />
        <KpiCard icon={<LifeBuoy size={20} strokeWidth={2.25} />} label="Tiket Open" value={kpis?.tickets.open ?? 0} />
        <KpiCard icon={<Gift size={20} strokeWidth={2.25} />} label="Total User" value={kpis?.users.total ?? 0} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Link
          href="/admin/pesanan"
          className="group rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-150"
        >
          <div className="font-heading text-xl font-extrabold text-ink tracking-tight group-hover:text-brand-700 transition-colors">
            Lihat Semua Pesanan →
          </div>
          <p className="mt-1.5 text-sm text-ink-muted font-medium">Filter, search, manual deliver, refund</p>
        </Link>
        <Link
          href="/admin/stok-monitor"
          className="group rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-150"
        >
          <div className="font-heading text-xl font-extrabold text-ink tracking-tight group-hover:text-brand-700 transition-colors">
            Stok Monitor →
          </div>
          <p className="mt-1.5 text-sm text-ink-muted font-medium">Quick upload stok, alert kritis</p>
        </Link>
      </div>
    </div>
  )
}

function computeHealthScore(k: Kpis | null): number {
  if (!k) return 0
  const todayPaid = k.orders.today_total - k.orders.pending_payment
  const deliveryRate = todayPaid > 0 ? Math.max(0, 1 - k.orders.delivery_failed / todayPaid) : 1
  const stockScore = k.stock.out === 0 ? 1 : Math.max(0, 1 - k.stock.out / 10)
  const ticketScore = k.tickets.open === 0 ? 1 : Math.max(0, 1 - k.tickets.open / 10)
  return Math.round(deliveryRate * 40 + stockScore * 30 + ticketScore * 30)
}
