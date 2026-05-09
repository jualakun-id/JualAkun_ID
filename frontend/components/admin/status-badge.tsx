import { cn } from '@/lib/utils'

const ORDER_STATUS = {
  pending_payment: { label: 'Menunggu Bayar', className: 'bg-zinc-800 text-zinc-400' },
  paid: { label: 'Dibayar', className: 'bg-info/15 text-info' },
  delivering: { label: 'Diproses', className: 'bg-primary/15 text-primary-light' },
  delivered: { label: 'Terkirim', className: 'bg-success/15 text-success' },
  confirmed: { label: 'Selesai', className: 'bg-success text-white' },
  delivery_failed: { label: 'Gagal Kirim', className: 'bg-danger/15 text-danger' },
  refunded: { label: 'Direfund', className: 'bg-warning/15 text-warning' },
  expired: { label: 'Kedaluwarsa', className: 'bg-zinc-800 text-zinc-500' },
} as const

const TICKET_STATUS = {
  open: { label: 'Open', className: 'bg-danger/15 text-danger' },
  in_review: { label: 'In Review', className: 'bg-warning/15 text-warning' },
  resolved_replaced: { label: 'Diganti', className: 'bg-success/15 text-success' },
  resolved_refunded: { label: 'Refunded', className: 'bg-warning/15 text-warning' },
  rejected: { label: 'Ditolak', className: 'bg-zinc-800 text-zinc-500' },
  closed: { label: 'Closed', className: 'bg-zinc-800 text-zinc-500' },
} as const

const NOTIF_STATUS = {
  pending: { label: 'Pending', className: 'bg-zinc-800 text-zinc-400' },
  sent: { label: 'Terkirim', className: 'bg-success/15 text-success' },
  failed: { label: 'Gagal', className: 'bg-danger/15 text-danger' },
} as const

type Variant = 'order' | 'ticket' | 'notification'

const MAP: Record<Variant, Record<string, { label: string; className: string }>> = {
  order: ORDER_STATUS,
  ticket: TICKET_STATUS,
  notification: NOTIF_STATUS,
}

export function StatusBadge({ variant, status }: { variant: Variant; status: string }) {
  const cfg = MAP[variant][status] ?? { label: status, className: 'bg-zinc-800 text-zinc-400' }
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
