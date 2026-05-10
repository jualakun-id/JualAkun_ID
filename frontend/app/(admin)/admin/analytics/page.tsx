import { AdminHeader } from '@/components/admin/admin-header'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDate } from '@/lib/utils'

type RevenueRow = { date: string; revenue: number; orders: number }
type TopProduct = { id: string; name: string; sold_count: number; price: number; thumbnail_url: string | null }

export const metadata = { title: 'Admin — Analytics' }

export default async function AdminAnalyticsPage() {
  const [revenue, top] = await Promise.all([
    adminFetch<RevenueRow[]>('/admin/analytics/revenue?days=30'),
    adminFetch<TopProduct[]>('/admin/analytics/top-products?limit=10'),
  ])

  const totalRevenue = (revenue ?? []).reduce((s, r) => s + r.revenue, 0)
  const totalOrders = (revenue ?? []).reduce((s, r) => s + r.orders, 0)
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  const maxRev = Math.max(...(revenue ?? []).map((r) => r.revenue), 1)

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Analytics" subtitle="30 hari terakhir" />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Revenue 30 hari" value={formatRupiah(totalRevenue)} />
        <Stat label="Pesanan" value={totalOrders.toString()} />
        <Stat label="Avg Order Value" value={formatRupiah(aov)} />
      </div>

      <div className="mt-6 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Revenue Harian</h2>
        <div className="mt-4 flex h-48 items-end gap-1">
          {(revenue ?? []).map((r) => (
            <div key={r.date} className="group relative flex-1 rounded-t bg-brand-200 hover:bg-brand-500 transition-colors duration-150" title={`${r.date}: ${formatRupiah(r.revenue)}`}
              style={{ height: `${(r.revenue / maxRev) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-subtle">
          <span>{revenue?.[0] ? formatDate(revenue[0].date) : '—'}</span>
          <span>{revenue?.[revenue.length - 1] ? formatDate(revenue[revenue.length - 1].date) : '—'}</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Top 10 Produk</h2>
        <div className="mt-4 space-y-2">
          {(top ?? []).map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-black/10 bg-brand-50/40 p-3">
              <span className="font-mono text-ink-subtle">#{i + 1}</span>
              <div className="flex-1">
                <div className="font-medium text-ink">{p.name}</div>
                <div className="text-xs text-ink-subtle">{p.sold_count.toLocaleString('id-ID')} terjual</div>
              </div>
              <span className="font-heading font-bold text-brand-700">{formatRupiah(p.price)}</span>
            </div>
          ))}
          {!top?.length ? <p className="text-sm text-ink-muted">Belum ada data.</p> : null}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="mt-1 font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-ink">{value}</div>
    </div>
  )
}
