import type { LucideIcon } from 'lucide-react'

type StatVariant = 'blue' | 'red' | 'green' | 'yellow'

const VARIANTS: Record<StatVariant, { bg: string; text: string; label: string; icon: string }> = {
  // Semua warna sudah lulus AA terhadap text yang ditentukan
  blue:   { bg: 'bg-stat-blue',   text: 'text-white',         label: 'text-white/85',  icon: 'text-white/30' },
  red:    { bg: 'bg-stat-red',    text: 'text-white',         label: 'text-white/85',  icon: 'text-white/30' },
  green:  { bg: 'bg-stat-green',  text: 'text-white',         label: 'text-white/85',  icon: 'text-white/30' },
  yellow: { bg: 'bg-stat-yellow', text: 'text-ink',           label: 'text-ink/75',    icon: 'text-ink/20' },
}

export function StatCard({
  variant,
  value,
  label,
  icon: Icon,
}: {
  variant: StatVariant
  value: string
  label: string
  icon: LucideIcon
}) {
  const v = VARIANTS[variant]
  return (
    <div className={`relative ${v.bg} rounded-2xl p-6 text-center shadow-lg overflow-hidden`}>
      <Icon
        className={`absolute -right-2 -top-2 w-20 h-20 ${v.icon}`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="relative">
        <div className={`text-3xl md:text-4xl font-extrabold tracking-tight ${v.text}`}>{value}</div>
        <div className={`text-sm font-medium mt-2 ${v.label}`}>{label}</div>
      </div>
    </div>
  )
}
