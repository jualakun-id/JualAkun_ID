import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'

type StatVariant = 'blue' | 'red' | 'green' | 'yellow'

const VARIANTS: Record<
  StatVariant,
  { bg: string; text: string; label: string; iconBg: string; iconColor: string }
> = {
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

type StatCardProps = {
  variant: StatVariant
  value: string
  label: string
  icon?: LucideIcon
  imageUrl?: string
}

/**
 * Stat Card 4:3 aspect ratio.
 *  - imageUrl: art image framed dengan padding seragam atas/bawah/kiri/kanan
 *  - icon: Lucide icon centered above value (fallback)
 */
export function StatCard({ variant, value, label, icon: Icon, imageUrl }: StatCardProps) {
  const v = VARIANTS[variant]

  // Mode dengan image art — image 16:9 + text below (card height adjusts otomatis)
  if (imageUrl) {
    return (
      <div
        className={`${v.bg} rounded-2xl border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] flex flex-col p-3 gap-2.5`}
      >
        {/* Art image — 16:9 aspect ratio */}
        <div className="relative rounded-lg border-2 border-black overflow-hidden aspect-[16/9] w-full">
          <Image
            src={imageUrl}
            alt={label}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover object-center"
          />
        </div>
        {/* Value + label below */}
        <div className="shrink-0 text-center px-1 pb-1">
          <div className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-none ${v.text}`}>
            {value}
          </div>
          <div className={`text-[10px] sm:text-xs font-medium mt-1 ${v.label}`}>{label}</div>
        </div>
      </div>
    )
  }

  // Fallback: icon mode
  return (
    <div
      className={`${v.bg} rounded-2xl border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] flex flex-col items-center justify-center text-center gap-2 aspect-[4/3] px-4 py-3`}
    >
      {Icon && (
        <div className={`w-12 h-12 rounded-xl border-2 border-black ${v.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${v.iconColor}`} strokeWidth={2} aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${v.text}`}>
          {value}
        </div>
        <div className={`text-[11px] sm:text-xs font-medium mt-1 ${v.label}`}>{label}</div>
      </div>
    </div>
  )
}
