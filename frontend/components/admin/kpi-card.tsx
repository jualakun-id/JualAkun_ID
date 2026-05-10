import { cn } from '@/lib/utils'

type Props = {
  icon?: React.ReactNode
  label: string
  value: string | number
  subLabel?: string
  trend?: number
  className?: string
}

export function KpiCard({ icon, label, value, subLabel, trend, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-ink-muted font-medium">{label}</span>
        {icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border-2 border-brand-200">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-3 font-heading text-3xl font-extrabold text-ink tracking-tight">{value}</div>
      {subLabel || trend !== undefined ? (
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {trend !== undefined ? (
            <span
              className={cn(
                'inline-flex items-center rounded-md border px-1.5 py-0.5 font-bold',
                trend >= 0
                  ? 'bg-success/10 text-success border-success/30'
                  : 'bg-danger/10 text-danger border-danger/30',
              )}
            >
              {trend >= 0 ? '↑ +' : '↓ '}
              {Math.abs(trend).toFixed(1)}%
            </span>
          ) : null}
          {subLabel ? <span className="text-ink-muted font-medium">{subLabel}</span> : null}
        </div>
      ) : null}
    </div>
  )
}
