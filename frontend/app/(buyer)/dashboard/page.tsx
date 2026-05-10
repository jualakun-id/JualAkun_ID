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

  const firstName = data?.profile?.full_name?.split(' ')[0] ?? 'Buyer'

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <DashboardTabs active="/dashboard" />

      <h1 className="mt-8 font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
        Halo, {firstName} 👋
      </h1>
      <p className="mt-2 text-[15px] text-ink-muted font-medium">
        Selamat datang kembali. Cek pesanan, saldo, dan referral kamu di sini.
      </p>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<ShoppingBag size={22} strokeWidth={2.25} />}
          label="Total Pesanan"
          value={String(data?.orders?.length ?? 0)}
          accent="brand"
        />
        <StatCard
          icon={<Wallet size={22} strokeWidth={2.25} />}
          label="Saldo Kredit"
          value={formatRupiah(data?.profile?.credits ?? 0)}
          accent="green"
        />
        <StatCard
          icon={<Gift size={22} strokeWidth={2.25} />}
          label="Referral Berhasil"
          value={String(data?.referral_stats?.credited ?? 0)}
          accent="purple"
        />
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
            Pesanan Terakhir
          </h2>
          <Link
            href="/dashboard/pesanan"
            className="text-sm font-bold text-brand-700 hover:text-brand-800 underline underline-offset-2"
          >
            Lihat semua →
          </Link>
        </div>
        <div className="mt-5 space-y-3">
          {data?.orders?.slice(0, 5).map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/pesanan/${o.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-150"
            >
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs text-ink-subtle font-medium">{o.order_number}</div>
                <div className="mt-1 font-bold text-ink text-[15px] truncate">{o.product_name}</div>
                <div className="mt-1 text-xs text-ink-muted font-medium">{formatDate(o.created_at)}</div>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
                <OrderStatusBadge status={o.status} />
                <span className="font-heading font-extrabold text-ink text-base whitespace-nowrap">
                  {formatRupiah(o.total_idr)}
                </span>
              </div>
            </Link>
          ))}
          {!data?.orders?.length ? (
            <div className="rounded-2xl border-2 border-dashed border-black/20 bg-white p-10 text-center">
              <p className="text-ink-muted font-medium">
                Belum ada pesanan.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-400 text-ink font-extrabold px-5 py-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
              >
                Mulai belanja →
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: 'brand' | 'green' | 'purple'
}) {
  const accentColor = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    green: 'bg-success/10 text-success border-success/30',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }[accent]

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 ${accentColor}`}>
        {icon}
      </div>
      <div className="mt-4 text-sm text-ink-muted font-medium">{label}</div>
      <div className="mt-1 font-heading text-2xl font-extrabold text-ink tracking-tight">{value}</div>
    </div>
  )
}
