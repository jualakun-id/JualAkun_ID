import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

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
    <div className="flex min-h-screen bg-brand-50/30 text-ink antialiased">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
