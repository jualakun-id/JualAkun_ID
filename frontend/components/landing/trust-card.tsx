import type { LucideIcon } from 'lucide-react'

export function TrustCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon
  title: string
  desc: string
}) {
  return (
    <div className="bg-white rounded-2xl p-7 border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] text-center hover:shadow-[0_6px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
          <Icon className="w-7 h-7" strokeWidth={1.75} aria-hidden="true" />
        </div>
      </div>
      <h3 className="font-bold text-ink text-base">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-subtle leading-relaxed">{desc}</p>
    </div>
  )
}
