'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LifeBuoy,
  Tag,
  Users,
  BarChart3,
  Bell,
  Boxes,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Logo } from '@/components/branding/logo'
import { createBrowserClient } from '@/lib/supabase'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produk', label: 'Produk', icon: Package },
  { href: '/admin/pesanan', label: 'Pesanan', icon: ShoppingCart },
  { href: '/admin/tiket', label: 'Tiket', icon: LifeBuoy },
  { href: '/admin/kupon', label: 'Kupon', icon: Tag },
  { href: '/admin/pengguna', label: 'Pengguna', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/notifikasi', label: 'Notifikasi', icon: Bell },
  { href: '/admin/stok-monitor', label: 'Stok Monitor', icon: Boxes },
] as const

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-close mobile drawer saat navigasi
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll saat drawer open di mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [mobileOpen])

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/masuk')
    router.refresh()
  }

  return (
    <>
      {/* Mobile top bar — only visible < md */}
      <div className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between bg-white border-b-2 border-black px-4">
        <Link href="/admin" className="inline-flex items-center gap-2" aria-label="Admin Panel">
          <Logo size="sm" asLink={false} />
          <span className="rounded-md bg-brand-500 text-ink text-[10px] font-extrabold px-1.5 py-0.5 border-2 border-black tracking-wider uppercase">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
          className="p-2 rounded-lg text-ink bg-white border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Backdrop saat drawer open di mobile */}
      {mobileOpen ? (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Sidebar — fixed di mobile (drawer), sticky di desktop */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-auto
          flex h-screen w-72 md:w-64 flex-col bg-white border-r-2 border-black
          transition-transform duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Admin navigation"
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b-2 border-black/10 flex items-start justify-between gap-2">
          <Link
            href="/admin"
            className="inline-flex items-start gap-2 group"
            aria-label="Jualakun.id Admin Panel"
          >
            <Logo size="sm" showTagline asLink={false} />
            <span className="mt-1 rounded-md bg-brand-500 text-ink text-[10px] font-extrabold px-1.5 py-0.5 border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] tracking-wider uppercase shrink-0">
              Admin
            </span>
          </Link>
          {/* Close button — only mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
            className="md:hidden p-1.5 rounded-md text-ink-muted hover:bg-gray-100 hover:text-ink"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-5 overflow-y-auto" aria-label="Admin sections">
          {NAV.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] border-2 border-black'
                    : 'text-ink-muted hover:bg-brand-50 hover:text-brand-700 border-2 border-transparent'
                }`}
              >
                <Icon size={18} strokeWidth={2.25} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t-2 border-black/10 px-3 py-3 space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-danger/10 hover:text-danger text-ink font-extrabold px-3 py-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm disabled:opacity-60 disabled:pointer-events-none"
          >
            <LogOut size={16} strokeWidth={2.5} />
            {loggingOut ? 'Keluar...' : 'Logout'}
          </button>
          <Link
            href="/"
            className="block text-center text-xs font-medium text-ink-muted hover:text-brand-700 transition-colors py-1"
          >
            ← Lihat website publik
          </Link>
        </div>
      </aside>
    </>
  )
}
