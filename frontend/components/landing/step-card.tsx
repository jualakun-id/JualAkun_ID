import type { LucideIcon } from 'lucide-react'

export function StepCard({
  num,
  label,
  icon: Icon,
}: {
  num: number
  label: string
  icon: LucideIcon
}) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      {/* Phone-like illustration with icon */}
      <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center transition-transform group-hover:-translate-y-1">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
        {/* Numbered badge */}
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-500 text-white text-sm font-extrabold flex items-center justify-center shadow-md">
          {num}
        </div>
      </div>
      <div className="text-center">
        <div className="text-ink font-bold text-[15px]">{label}</div>
      </div>
    </div>
  )
}
