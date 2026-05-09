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
  /** Pakai icon Lucide (legacy / fallback) */
  icon?: LucideIcon
  /** Pakai gambar art generated (URL Supabase Storage) */
  imageUrl?: string
}

/**
 * Stat Card 4:3 aspect ratio.
 *
 * Dua mode:
 *  - imageUrl: art image fills card with text overlay (recommended)
 *  - icon: Lucide icon centered above value (fallback)
 */
export function StatCard({ variant, value, label, icon: Icon, imageUrl }: StatCardProps) {
  const v = VARIANTS[variant]

  // Mode dengan image art
  if (imageUrl) {
    return (
      <div
        className={`${v.bg} rounded-2xl border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] overflow-hidden relative aspect-[4/3] flex flex-col`}
      >
        {/* Art image — fills top portion */}
        <div className="relative flex-1 overflow-hidden">
          <Image
            src={imageUrl}
            alt={label}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
        {/* Bottom solid color band with value + label */}
        <div className="px-4 py-3 text-center">
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${v.text}`}>
            {value}
          </div>
          <div className={`text-[11px] sm:text-xs font-medium mt-1 ${v.label}`}>{label}</div>
        </div>
      </div>
    )
  }

  // Fallback: icon mode (current behavior, dengan aspect 4:3)
  return (
    <div
      className={`${v.bg} rounded-2xl border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] flex flex-col items-center justify-center text-center gap-2 aspect-[4/3] px-4 py-3`}
    >
      {Icon && (
        <div className={`w-12 h-12 rounded-xl ${v.iconBg} flex items-center justify-center shrink-0`}>
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
