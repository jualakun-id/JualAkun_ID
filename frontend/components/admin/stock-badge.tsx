import { cn } from '@/lib/utils'

export function StockBadge({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border-2 border-danger/40 bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger whitespace-nowrap">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger" aria-hidden="true" />
        Habis
      </span>
    )
  }
  if (count <= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border-2 border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-bold text-warning whitespace-nowrap">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning animate-pulse" aria-hidden="true" />
        {count} unit
      </span>
    )
  }
  return <span className="text-sm font-extrabold text-success tabular-nums">{count}</span>
}

export function FormatRupiahCell({ value }: { value: number }) {
  return (
    <span className={cn('font-mono font-medium tabular-nums')}>
      {new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(value)}
    </span>
  )
}
