'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { Logo } from '@/components/branding/logo'
import { createBrowserClient } from '@/lib/supabase'

const NAV_ITEMS = [
  { href: '/#produk', label: 'Katalog' },
  { href: '/#cara-pesan', label: 'Cara Pesan' },
  { href: '/#faq', label: 'FAQ' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    handler()
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    setLoggingOut(false)
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => {
    // Anchor link (e.g. /#streaming) only active when on homepage
    if (href.includes('#')) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header
      className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-sm border-b border-gray-100' : ''
      }`}
    >
      <div className="container mx-auto flex h-[88px] items-center justify-end md:justify-between px-4 max-w-7xl relative">
        {/* Logo — centered on mobile, left-aligned on desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <Logo size="md" showTagline />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 text-[15px] font-semibold" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-ink hover:text-brand-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* CTA — conditional: login state determines tombol yang muncul */}
        <div className="hidden md:flex items-center gap-2">
          {authed === null ? (
            // Skeleton placeholder selama auth state masih loading (hindari flash content)
            <div className="h-10 w-44 rounded-lg bg-gray-100 animate-pulse" aria-hidden="true" />
          ) : authed ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[15px] font-extrabold px-4 sm:px-5 py-2 rounded-lg border-2 border-black bg-brand-500 text-ink hover:bg-brand-400 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
              >
                <LayoutDashboard size={16} strokeWidth={2.5} />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-brand-50 text-ink font-extrabold px-4 sm:px-5 py-2 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm disabled:opacity-60 disabled:pointer-events-none"
              >
                <LogOut size={16} strokeWidth={2.5} />
                {loggingOut ? 'Keluar...' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/masuk"
                className="text-[15px] font-bold px-4 py-2 rounded-lg text-ink hover:text-brand-700 hover:bg-brand-50 transition-all duration-150"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="text-[15px] font-extrabold px-5 py-2 rounded-lg border-2 border-black bg-brand-500 text-ink hover:bg-brand-400 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger — line art style with neo-brutalist shadow */}
        <button
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          className="md:hidden relative p-2 rounded-lg text-ink bg-white border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} strokeWidth={3} /> : <Menu size={22} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Menu — line-art card style */}
      {menuOpen && (
        <div className="md:hidden bg-white border-y-2 border-black px-4 py-5 animate-fade-in shadow-[0_6px_0_rgba(0,0,0,0.9)] relative">
          <nav className="flex flex-col gap-1 text-base font-semibold" aria-label="Mobile">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-3 rounded-lg ${
                    active ? 'bg-brand-50 text-brand-700 font-bold' : 'text-ink hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <hr className="border-gray-200 my-3 border-dashed" />
            {authed === null ? null : authed ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 border-black bg-brand-500 text-ink text-center font-extrabold shadow-[0_3px_0_rgba(0,0,0,0.9)] active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)]"
                >
                  <LayoutDashboard size={18} strokeWidth={2.5} />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 border-black bg-white text-ink font-extrabold shadow-[0_3px_0_rgba(0,0,0,0.9)] active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] disabled:opacity-60 disabled:pointer-events-none"
                >
                  <LogOut size={18} strokeWidth={2.5} />
                  {loggingOut ? 'Keluar...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/masuk"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-3 rounded-lg text-ink font-bold hover:bg-gray-50"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 px-5 py-3 rounded-lg border-2 border-black bg-brand-500 text-ink text-center font-extrabold shadow-[0_3px_0_rgba(0,0,0,0.9)] active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)]"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
