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
    <section className="container mx-auto px-4 py-8">
      <DashboardTabs active="/dashboard/referral" />
      <h1 className="mt-8 font-heading text-h1">Program Referral</h1>
      <p className="mt-2 text-ink-muted">
        Bagikan link referral. Setiap teman yang transaksi pertama, Anda dapat kredit Rp 5.000.
      </p>

      {data ? (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Stat label="Total Referral" value={data.stats.total_referrals.toString()} />
            <Stat label="Berhasil" value={data.stats.credited.toString()} />
            <Stat label="Pending" value={data.stats.pending.toString()} />
            <Stat label="Total Earned" value={formatRupiah(data.stats.total_earned)} />
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="text-sm text-ink-muted">Kode referral kamu</div>
            <div className="mt-2 font-mono text-h2 text-brand-500">{data.referral_code}</div>
            <ReferralCopy link={data.referral_link} />
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-h3">Riwayat</h2>
            <div className="mt-3 space-y-2">
              {data.history.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-ink-muted">
                  Belum ada teman yang daftar via link Anda.
                </div>
              ) : (
                data.history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                    <div>
                      <div className="text-ink">{h.referred_email}</div>
                      <div className="text-xs text-ink-subtle">{h.status}</div>
                    </div>
                    <span className="font-heading font-semibold text-success">+{formatRupiah(h.credit_amount)}</span>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="mt-1 font-heading text-h3 text-ink">{value}</div>
    </div>
  )
}
