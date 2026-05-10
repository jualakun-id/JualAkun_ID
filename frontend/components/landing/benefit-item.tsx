import type { LucideIcon } from 'lucide-react'

export function BenefitItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon
  title: string
  desc: string
}) {
  return (
    <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-3 md:gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 text-brand-500">
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>
      <div>
        <div className="text-ink font-bold text-[17px] font-heading">{title}</div>
        <div className="text-ink-muted text-[15px] mt-1 leading-relaxed font-medium">{desc}</div>
      </div>
    </div>
  )
}
