import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import { BuyerHeader } from '@/components/layout/buyer-header'
import { Footer } from '@/components/layout/footer'

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

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink antialiased">
      <BuyerHeader />
      <main className="flex-1 bg-brand-50/30">{children}</main>
      <Footer />
    </div>
  )
}
