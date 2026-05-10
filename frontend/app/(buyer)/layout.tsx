import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/masuk')
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink antialiased">
      <Header />
      <main className="flex-1 bg-brand-50/30">{children}</main>
      <Footer />
    </div>
  )
}
