import Link from 'next/link'
import { ShoppingBag, Wallet, Gift } from 'lucide-react'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { createServerClient } from '@/lib/supabase-server'
import { serverFetch } from '@/lib/server-fetch'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { OrderStatus } from '@/types'

type DashboardData = {
  profile: { full_name: string; email: string; phone_wa: string | null; referral_code: string; credits: number; joined_at: string }
  orders: { id: string; order_number: string; product_name: string; product_thumbnail: string | null; total_idr: number; status: OrderStatus; created_at: string }[]
  referral_stats: { total_referrals: number; credited: number; pending: number; total_earned: number }
}

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const data = await serverFetch<DashboardData>('/dashboard', { jwt: session?.access_token, cache: 'no-store' })

  return (
    <section className="container mx-auto px-4 py-8">
      <DashboardTabs active="/dashboard" />

      <h1 className="mt-8 font-heading text-h1">Halo, {data?.profile?.full_name?.split(' ')[0] ?? 'Buyer'} 👋</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard icon={<ShoppingBag size={20} strokeWidth={1.5} />} label="Total Pesanan" value={String(data?.orders?.length ?? 0)} />
        <StatCard icon={<Wallet size={20} strokeWidth={1.5} />} label="Saldo Kredit" value={formatRupiah(data?.profile?.credits ?? 0)} />
        <StatCard icon={<Gift size={20} strokeWidth={1.5} />} label="Referral" value={`${data?.referral_stats?.credited ?? 0} berhasil`} />
      </div>

      <div className="mt-8">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-h2">Pesanan Terakhir</h2>
          <Link href="/dashboard/pesanan" className="text-sm text-primary hover:text-primary-light">Lihat semua →</Link>
        </div>
        <div className="mt-4 space-y-2">
          {data?.orders?.slice(0, 5).map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/pesanan/${o.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 hover:border-primary/50"
            >
              <div>
                <div className="font-mono text-xs text-text-subtle">{o.order_number}</div>
                <div className="mt-1 font-medium text-text">{o.product_name}</div>
                <div className="mt-1 text-xs text-text-subtle">{formatDate(o.created_at)}</div>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={o.status} />
                <span className="font-heading font-bold text-primary">{formatRupiah(o.total_idr)}</span>
              </div>
            </Link>
          ))}
          {!data?.orders?.length ? (
            <div className="rounded-lg border border-border bg-surface p-8 text-center text-text-muted">
              Belum ada pesanan. <Link href="/" className="text-primary">Mulai belanja →</Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
        {icon}
      </div>
      <div className="mt-3 text-sm text-text-muted">{label}</div>
      <div className="mt-1 font-heading text-h3 text-text">{value}</div>
    </div>
  )
}
