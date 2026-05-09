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
    <div className={cn('rounded-xl border border-border bg-surface p-5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">{label}</span>
        {icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-3 font-heading text-h2 text-text">{value}</div>
      {subLabel || trend !== undefined ? (
        <div className="mt-1 flex items-center gap-2 text-xs">
          {trend !== undefined ? (
            <span className={trend >= 0 ? 'text-success' : 'text-danger'}>
              {trend >= 0 ? '+' : ''}
              {trend.toFixed(1)}%
            </span>
          ) : null}
          {subLabel ? <span className="text-text-subtle">{subLabel}</span> : null}
        </div>
      ) : null}
    </div>
  )
}
