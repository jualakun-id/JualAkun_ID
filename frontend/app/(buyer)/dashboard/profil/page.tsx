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
    <section className="container mx-auto max-w-2xl px-4 py-8">
      <DashboardTabs active="/dashboard/profil" />
      <h1 className="mt-8 font-heading text-h1">Profil</h1>
      <div className="mt-6">
        <ProfileForm
          email={user?.email ?? ''}
          fullName={profile?.full_name ?? ''}
          phoneWa={profile?.phone_wa ?? ''}
          referralCode={profile?.referral_code ?? ''}
        />
      </div>
    </section>
  )
}
