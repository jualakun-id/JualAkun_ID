import Link from 'next/link'
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
} from 'lucide-react'

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
  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-border-subtle bg-surface">
      <div className="px-6 py-5 font-heading text-h3">
        <span className="font-bold text-text">Jual</span>
        <span className="font-extrabold text-primary">Akun</span>
        <span className="ml-2 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary-light">
          Admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <Icon size={18} strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
