'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/branding/logo'
import { createBrowserClient } from '@/lib/supabase'

export function BuyerHeader() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="container mx-auto flex h-[88px] items-center justify-between px-4 max-w-7xl">
        <Link href="/dashboard" className="transition-transform hover:-translate-y-0.5">
          <Logo size="md" showTagline />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-brand-50 text-ink font-extrabold px-4 sm:px-5 py-2 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm disabled:opacity-60 disabled:pointer-events-none"
        >
          <LogOut size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">{loading ? 'Keluar...' : 'Logout'}</span>
        </button>
      </div>
    </header>
  )
}
