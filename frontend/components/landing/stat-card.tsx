import type { LucideIcon } from 'lucide-react'

type StatVariant = 'blue' | 'red' | 'green' | 'yellow'

const VARIANTS: Record<StatVariant, { bg: string; text: string; label: string; iconBg: string; iconColor: string }> = {
  // Semua warna sudah lulus AA terhadap text yang ditentukan
  blue: {
    bg: 'bg-stat-blue',
    text: 'text-white',
    label: 'text-white/85',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  red: {
    bg: 'bg-stat-red',
    text: 'text-white',
    label: 'text-white/85',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  green: {
    bg: 'bg-stat-green',
    text: 'text-white',
    label: 'text-white/85',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  yellow: {
    bg: 'bg-stat-yellow',
    text: 'text-ink',
    label: 'text-ink/75',
    iconBg: 'bg-ink/10',
    iconColor: 'text-ink',
  },
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
    <div className={`${v.bg} rounded-2xl p-6 text-center shadow-lg flex flex-col items-center gap-3`}>
      <div className={`w-12 h-12 rounded-full ${v.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${v.iconColor}`} strokeWidth={2} aria-hidden="true" />
      </div>
      <div>
        <div className={`text-3xl md:text-4xl font-extrabold tracking-tight ${v.text}`}>{value}</div>
        <div className={`text-sm font-medium mt-1 ${v.label}`}>{label}</div>
      </div>
    </div>
  )
}
