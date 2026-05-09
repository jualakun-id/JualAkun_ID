import { cn } from '@/lib/utils'

export function StockBadge({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-danger/30 bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">
        🔴 Habis
      </span>
    )
  }
  if (count <= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
        ⚠️ {count} unit
      </span>
    )
  }
  return <span className="text-sm font-semibold text-success">{count}</span>
}

export function FormatRupiahCell({ value }: { value: number }) {
  return <span className={cn('font-mono')}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)}</span>
}
