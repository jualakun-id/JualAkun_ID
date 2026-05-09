import type { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending_payment: { label: 'Menunggu Bayar', className: 'bg-zinc-800 text-zinc-400' },
  paid: { label: 'Dibayar', className: 'bg-info/15 text-info' },
  delivering: { label: 'Diproses', className: 'bg-primary/15 text-primary-light' },
  delivered: { label: 'Terkirim', className: 'bg-success/15 text-success' },
  confirmed: { label: 'Selesai', className: 'bg-success text-white' },
  delivery_failed: { label: 'Gagal Kirim', className: 'bg-danger/15 text-danger' },
  refunded: { label: 'Direfund', className: 'bg-warning/15 text-warning' },
  expired: { label: 'Kedaluwarsa', className: 'bg-zinc-800 text-zinc-500' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  )
}
