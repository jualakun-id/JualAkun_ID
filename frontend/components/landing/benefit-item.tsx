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
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 text-brand-500">
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>
      <div>
        <div className="text-ink font-semibold">{title}</div>
        <div className="text-ink-subtle text-sm mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </div>
  )
}
