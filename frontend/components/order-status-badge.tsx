import type { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending_payment: { label: 'Menunggu Bayar', className: 'bg-warning/15 text-warning border-warning/40' },
  paid: { label: 'Dibayar', className: 'bg-info/15 text-info border-info/40' },
  delivering: { label: 'Diproses', className: 'bg-brand-50 text-brand-700 border-brand-200' },
  delivered: { label: 'Terkirim', className: 'bg-success/15 text-success border-success/40' },
  confirmed: { label: 'Selesai', className: 'bg-success text-white border-success' },
  delivery_failed: { label: 'Gagal Kirim', className: 'bg-danger/15 text-danger border-danger/40' },
  refunded: { label: 'Direfund', className: 'bg-warning/20 text-warning border-warning/50' },
  expired: { label: 'Kedaluwarsa', className: 'bg-gray-100 text-ink-muted border-gray-300' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold whitespace-nowrap',
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  )
}
