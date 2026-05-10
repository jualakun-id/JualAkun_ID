import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import { BuyerHeader } from '@/components/layout/buyer-header'
import { Footer } from '@/components/layout/footer'
import { IdleLogout } from '@/components/idle-logout'

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    // Preserve user intent: redirect balik ke halaman ini setelah login berhasil.
    // x-pathname & x-search di-set oleh middleware (Server Component tidak bisa
    // akses request URL langsung).
    const headerList = await headers()
    const pathname = headerList.get('x-pathname') ?? ''
    const search = headerList.get('x-search') ?? ''
    const next = pathname ? `${pathname}${search}` : ''
    const loginUrl = next ? `/masuk?next=${encodeURIComponent(next)}` : '/masuk'
    redirect(loginUrl)
  }

  // Role-based access: admin tidak boleh akses area buyer — redirect ke admin panel
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink antialiased">
      <BuyerHeader />
      <main className="flex-1 bg-brand-50/30">{children}</main>
      <Footer />
      <IdleLogout />
    </div>
  )
}
