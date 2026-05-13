import { cn } from '@/lib/utils'

const ORDER_STATUS = {
  pending_payment: { label: 'Menunggu Bayar', className: 'bg-warning/15 text-warning border-warning/40' },
  verifying: { label: 'Verifikasi', className: 'bg-amber-50 text-amber-700 border-amber-400' },
  paid: { label: 'Dibayar', className: 'bg-info/15 text-info border-info/40' },
  delivering: { label: 'Diproses', className: 'bg-brand-50 text-brand-700 border-brand-200' },
  delivered: { label: 'Terkirim', className: 'bg-success/15 text-success border-success/40' },
  confirmed: { label: 'Selesai', className: 'bg-success text-white border-success' },
  delivery_failed: { label: 'Gagal Kirim', className: 'bg-danger/15 text-danger border-danger/40' },
  refunded: { label: 'Direfund', className: 'bg-warning/20 text-warning border-warning/50' },
  cancelled: { label: 'Dibatalkan', className: 'bg-danger/10 text-danger border-danger/40' },
  expired: { label: 'Kedaluwarsa', className: 'bg-gray-100 text-ink-muted border-gray-300' },
} as const

const TICKET_STATUS = {
  open: { label: 'Open', className: 'bg-danger/15 text-danger border-danger/40' },
  in_review: { label: 'In Review', className: 'bg-warning/15 text-warning border-warning/40' },
  resolved_replaced: { label: 'Diganti', className: 'bg-success/15 text-success border-success/40' },
  resolved_refunded: { label: 'Refunded', className: 'bg-warning/20 text-warning border-warning/50' },
  rejected: { label: 'Ditolak', className: 'bg-gray-100 text-ink-muted border-gray-300' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-ink-muted border-gray-300' },
} as const

const NOTIF_STATUS = {
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning border-warning/40' },
  sent: { label: 'Terkirim', className: 'bg-success/15 text-success border-success/40' },
  failed: { label: 'Gagal', className: 'bg-danger/15 text-danger border-danger/40' },
} as const

type Variant = 'order' | 'ticket' | 'notification'

const MAP: Record<Variant, Record<string, { label: string; className: string }>> = {
  order: ORDER_STATUS,
  ticket: TICKET_STATUS,
  notification: NOTIF_STATUS,
}

export function StatusBadge({ variant, status }: { variant: Variant; status: string }) {
  const cfg = MAP[variant][status] ?? {
    label: status,
    className: 'bg-gray-100 text-ink-muted border-gray-300',
  }
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
