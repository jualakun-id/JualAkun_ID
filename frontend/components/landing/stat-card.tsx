import type { LucideIcon } from 'lucide-react'

type StatVariant = 'blue' | 'red' | 'green' | 'yellow'

const VARIANTS: Record<StatVariant, { bg: string; text: string; label: string; iconBg: string; iconColor: string }> = {
  // Semua warna sudah lulus AA terhadap text yang ditentukan
  blue: {
    bg: 'bg-stat-blue',
    text: 'text-white',
    label: 'text-white/90',
    iconBg: 'bg-white/25',
    iconColor: 'text-white',
  },
  red: {
    bg: 'bg-stat-red',
    text: 'text-white',
    label: 'text-white/90',
    iconBg: 'bg-white/25',
    iconColor: 'text-white',
  },
  green: {
    bg: 'bg-stat-green',
    text: 'text-white',
    label: 'text-white/90',
    iconBg: 'bg-white/25',
    iconColor: 'text-white',
  },
  yellow: {
    bg: 'bg-stat-yellow',
    text: 'text-ink',
    label: 'text-ink/80',
    iconBg: 'bg-ink/15',
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
    <div
      className={`${v.bg} rounded-2xl px-4 py-7 sm:px-6 sm:py-8 shadow-lg flex flex-col items-center justify-center text-center gap-3`}
    >
      <div
        className={`w-14 h-14 rounded-2xl ${v.iconBg} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-7 h-7 ${v.iconColor}`} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="flex flex-col items-center">
        <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-none ${v.text}`}>
          {value}
        </div>
        <div className={`text-xs sm:text-sm font-medium mt-1.5 ${v.label}`}>{label}</div>
      </div>
    </div>
  )
}
