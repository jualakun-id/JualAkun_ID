'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Package,
  PackagePlus,
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
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/branding/logo'
import { createBrowserClient } from '@/lib/supabase'
import { api } from '@/lib/api'

type BadgeKey = 'pendingOrders' | 'newUsersToday'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Kalau di-set, nav item tampil badge notif dari counts[badgeKey]. */
  badgeKey?: BadgeKey
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produk', label: 'Produk', icon: Package },
  { href: '/admin/supplier-baru', label: 'Produk Supplier', icon: PackagePlus },
  { href: '/admin/stok-monitor', label: 'Stok Monitor', icon: Boxes },
  { href: '/admin/pesanan', label: 'Pesanan', icon: ShoppingCart, badgeKey: 'pendingOrders' },
  { href: '/admin/tiket', label: 'Tiket', icon: LifeBuoy },
  { href: '/admin/kupon', label: 'Kupon', icon: Tag },
  { href: '/admin/pengguna', label: 'Pengguna', icon: Users, badgeKey: 'newUsersToday' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/notifikasi', label: 'Notifikasi', icon: Bell },
]

type AdminCounts = { pendingOrders: number; newUsersToday: number }

/** Subset KPI dashboard yang dipakai untuk badge sidebar. */
type DashboardKpis = {
  orders?: { paid?: number }
  users?: { new_today?: number }
}

const POLL_INTERVAL_MS = 60_000

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [counts, setCounts] = useState<AdminCounts>({ pendingOrders: 0, newUsersToday: 0 })

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

  // Poll count notif (order menunggu fulfill + user baru hari ini) tiap 60s.
  // Badge di sidebar update otomatis tanpa reload halaman.
  useEffect(() => {
    let cancelled = false
    async function loadCounts() {
      const res = await api.get<DashboardKpis>('/admin/analytics/dashboard')
      if (cancelled || !res.ok) return
      setCounts({
        pendingOrders: res.data.orders?.paid ?? 0,
        newUsersToday: res.data.users?.new_today ?? 0,
      })
    }
    loadCounts()
    const id = setInterval(loadCounts, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

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
        <Link href="/admin" aria-label="Jualakun.id Admin">
          <Logo size="sm" asLink={false} />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
          className="relative p-2 rounded-lg text-ink bg-white border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
        >
          <Menu size={20} strokeWidth={2.5} />
          {counts.pendingOrders + counts.newUsersToday > 0 ? (
            <span
              className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-danger border-2 border-white"
              aria-hidden="true"
            />
          ) : null}
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
          <Link href="/admin" aria-label="Jualakun.id Admin Panel">
            <Logo size="sm" showTagline asLink={false} />
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
          {NAV.map(({ href, label, icon: Icon, badgeKey }) => {
            const isActive = href === '/admin' ? pathname === href : pathname.startsWith(href)
            const count = badgeKey ? counts[badgeKey] : 0
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
                <Icon size={18} strokeWidth={2.25} className="shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {count > 0 ? (
                  <span
                    className="shrink-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-danger text-white text-[11px] font-extrabold border border-black tabular-nums"
                    aria-label={`${count} notifikasi`}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                ) : null}
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
