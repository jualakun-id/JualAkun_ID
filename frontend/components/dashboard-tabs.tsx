import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Gift, User } from 'lucide-react'

const TABS = [
  { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { href: '/dashboard/pesanan', label: 'Pesanan', icon: ShoppingBag },
  { href: '/dashboard/referral', label: 'Referral', icon: Gift },
  { href: '/dashboard/profil', label: 'Profil', icon: User },
] as const

export function DashboardTabs({ active }: { active: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive = active === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/15 text-primary'
                : 'text-text-muted hover:bg-surface-2 hover:text-text'
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
