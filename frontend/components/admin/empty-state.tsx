import type { LucideIcon } from 'lucide-react'

type Action = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}

type Props = {
  icon: LucideIcon
  title: string
  description?: string
  action?: Action
  /** Tampilkan dengan dashed border (untuk kartu standalone) atau tanpa (untuk inline di table) */
  variant?: 'card' | 'inline'
}

/**
 * EmptyState — placeholder cantik untuk page/list yang belum ada datanya.
 * Pakai di admin & buyer pages dgn brand voice yang ramah.
 */
export function EmptyState({ icon: Icon, title, description, action, variant = 'card' }: Props) {
  const wrapperClass =
    variant === 'card'
      ? 'rounded-2xl border-2 border-dashed border-black/20 bg-white p-12'
      : 'p-10'

  return (
    <div className={`${wrapperClass} text-center`}>
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border-2 border-brand-200">
        <Icon size={26} strokeWidth={2} />
      </div>
      <p className="mt-4 font-heading text-lg font-extrabold text-ink tracking-tight">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-ink-muted font-medium leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      ) : null}
      {action ? (
        <a
          href={action.href}
          className={`mt-5 inline-flex items-center gap-1.5 font-extrabold px-5 py-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm ${
            action.variant === 'secondary'
              ? 'bg-white hover:bg-gray-50 text-ink'
              : 'bg-brand-500 hover:bg-brand-400 text-ink'
          }`}
        >
          {action.label}
        </a>
      ) : null}
    </div>
  )
}
