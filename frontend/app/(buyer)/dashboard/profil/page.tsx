import { DashboardTabs } from '@/components/dashboard-tabs'
import { ProfileForm } from './profile-form'
import { createServerClient } from '@/lib/supabase-server'

export const metadata = { title: 'Profil' }

export default async function DashboardProfilPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone_wa, referral_code, credits')
    .eq('id', user!.id)
    .maybeSingle()

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <DashboardTabs active="/dashboard/profil" />

      <div className="mt-8 max-w-2xl">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
          Profil
        </h1>
        <p className="mt-2 text-[15px] text-ink-muted font-medium">
          Update info kamu — email & nomor WA dipakai untuk delivery & notifikasi.
        </p>
        <div className="mt-7 rounded-2xl border-2 border-black bg-white p-6 md:p-7 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <ProfileForm
            email={user?.email ?? ''}
            fullName={profile?.full_name ?? ''}
            phoneWa={profile?.phone_wa ?? ''}
            referralCode={profile?.referral_code ?? ''}
          />
        </div>
      </div>
    </section>
  )
}
