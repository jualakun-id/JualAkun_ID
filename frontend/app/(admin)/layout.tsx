import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { IdleLogout } from '@/components/idle-logout'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    redirect('/masuk')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div
      className="flex min-h-screen bg-brand-50 text-ink antialiased"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1.5px 1.5px, rgba(18,150,168,0.15) 1.5px, transparent 0)',
        backgroundSize: '18px 18px',
      }}
    >
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <IdleLogout />
    </div>
  )
}
