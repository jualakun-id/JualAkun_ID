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
    <div className="px-8 py-8">
      <AdminHeader title="Analytics" subtitle="30 hari terakhir" />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Revenue 30 hari" value={formatRupiah(totalRevenue)} />
        <Stat label="Pesanan" value={totalOrders.toString()} />
        <Stat label="Avg Order Value" value={formatRupiah(aov)} />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-h3">Revenue Harian</h2>
        <div className="mt-4 flex h-48 items-end gap-1">
          {(revenue ?? []).map((r) => (
            <div key={r.date} className="group relative flex-1 rounded-t bg-primary/30 hover:bg-primary" title={`${r.date}: ${formatRupiah(r.revenue)}`}
              style={{ height: `${(r.revenue / maxRev) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-text-subtle">
          <span>{revenue?.[0] ? formatDate(revenue[0].date) : '—'}</span>
          <span>{revenue?.[revenue.length - 1] ? formatDate(revenue[revenue.length - 1].date) : '—'}</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-h3">Top 10 Produk</h2>
        <div className="mt-4 space-y-2">
          {(top ?? []).map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-2 p-3">
              <span className="font-mono text-text-subtle">#{i + 1}</span>
              <div className="flex-1">
                <div className="font-medium text-text">{p.name}</div>
                <div className="text-xs text-text-subtle">{p.sold_count.toLocaleString('id-ID')} terjual</div>
              </div>
              <span className="font-heading font-bold text-primary">{formatRupiah(p.price)}</span>
            </div>
          ))}
          {!top?.length ? <p className="text-sm text-text-muted">Belum ada data.</p> : null}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="text-sm text-text-muted">{label}</div>
      <div className="mt-1 font-heading text-h2 text-text">{value}</div>
    </div>
  )
}
