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
    <nav className="grid grid-cols-4 gap-1 rounded-xl border-2 border-black bg-white p-1.5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive = active === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-brand-500 text-ink'
                : 'text-ink-muted hover:bg-brand-50 hover:text-brand-700'
            }`}
          >
            <Icon size={16} strokeWidth={2.25} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
