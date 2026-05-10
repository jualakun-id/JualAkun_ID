import { Gift, Users, CheckCircle2, Clock, Wallet } from 'lucide-react'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { ReferralCopy } from './referral-copy'
import { createServerClient } from '@/lib/supabase-server'
import { serverFetch } from '@/lib/server-fetch'
import { formatRupiah } from '@/lib/utils'

type ReferralData = {
  referral_code: string
  referral_link: string
  credits: number
  stats: { total_referrals: number; credited: number; pending: number; total_earned: number }
  history: { referred_email: string; status: string; credit_amount: number; credited_at: string | null }[]
}

export const metadata = { title: 'Referral' }

export default async function DashboardReferralPage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const data = await serverFetch<ReferralData>('/referral', { jwt: session?.access_token, cache: 'no-store' })

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <DashboardTabs active="/dashboard/referral" />
      <h1 className="mt-8 font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
        Program Referral
      </h1>
      <p className="mt-2 text-[15px] text-ink-muted leading-relaxed font-medium">
        Bagikan link referral kamu. Setiap teman yang daftar & transaksi pertama, kamu dapat kredit{' '}
        <strong className="text-ink">Rp 5.000</strong> yang langsung bisa dipakai belanja.
      </p>

      {data ? (
        <>
          <div className="mt-7 grid gap-4 grid-cols-2 md:grid-cols-4">
            <Stat label="Total Referral" value={data.stats.total_referrals.toString()} icon={<Users size={20} strokeWidth={2.25} />} accent="brand" />
            <Stat label="Berhasil" value={data.stats.credited.toString()} icon={<CheckCircle2 size={20} strokeWidth={2.25} />} accent="green" />
            <Stat label="Pending" value={data.stats.pending.toString()} icon={<Clock size={20} strokeWidth={2.25} />} accent="yellow" />
            <Stat label="Total Earned" value={formatRupiah(data.stats.total_earned)} icon={<Wallet size={20} strokeWidth={2.25} />} accent="purple" />
          </div>

          <div className="mt-6 rounded-2xl border-2 border-black bg-white p-6 md:p-7 shadow-[0_4px_0_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2.5 text-sm font-bold text-ink-muted">
              <Gift size={16} className="text-brand-600" strokeWidth={2.25} />
              Kode referral kamu
            </div>
            <div className="mt-3 font-mono text-3xl md:text-4xl font-extrabold text-brand-700 tracking-wider uppercase">
              {data.referral_code}
            </div>
            <ReferralCopy link={data.referral_link} />
          </div>

          <div className="mt-8">
            <h2 className="font-heading text-2xl font-extrabold text-ink tracking-tight">Riwayat</h2>
            <div className="mt-4 space-y-3">
              {data.history.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-black/20 bg-white p-10 text-center">
                  <Users size={36} className="mx-auto text-ink-subtle/50" strokeWidth={1.5} />
                  <p className="mt-4 text-ink-muted font-medium">Belum ada teman yang daftar via link kamu.</p>
                  <p className="mt-2 text-xs text-ink-subtle font-medium">Bagikan link di sosmed atau WhatsApp untuk mulai dapat kredit.</p>
                </div>
              ) : (
                data.history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-white p-4 sm:p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-ink font-bold text-[15px] truncate">{h.referred_email}</div>
                      <div className="mt-0.5 text-xs text-ink-muted font-medium capitalize">{h.status}</div>
                    </div>
                    <span className="font-heading font-extrabold text-success text-base whitespace-nowrap">
                      +{formatRupiah(h.credit_amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent: 'brand' | 'green' | 'yellow' | 'purple'
}) {
  const accentColor = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    green: 'bg-success/10 text-success border-success/30',
    yellow: 'bg-warning/15 text-warning border-warning/40',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }[accent]

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-4 sm:p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 ${accentColor}`}>
        {icon}
      </div>
      <div className="mt-3 text-xs sm:text-sm text-ink-muted font-medium">{label}</div>
      <div className="mt-1 font-heading text-xl sm:text-2xl font-extrabold text-ink tracking-tight">{value}</div>
    </div>
  )
}
