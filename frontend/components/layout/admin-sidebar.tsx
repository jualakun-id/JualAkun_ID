'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
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
} from 'lucide-react'
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

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/masuk')
    router.refresh()
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col bg-white border-r-2 border-black">
      {/* Brand */}
      <div className="px-5 py-5 border-b-2 border-black/10">
        <Link href="/admin" className="inline-flex items-center gap-2 group">
          <div className="font-heading text-xl tracking-tight">
            <span className="font-extrabold text-ink">Jual</span>
            <span className="font-extrabold text-brand-600">Akun</span>
          </div>
          <span className="rounded-md bg-brand-500 text-ink text-[10px] font-extrabold px-2 py-0.5 border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] tracking-wider uppercase">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-5 overflow-y-auto">
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
  )
}
