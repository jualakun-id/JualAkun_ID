export const REASON_LABELS: Record<string, string> = {
  account_invalid: 'Credentials tidak valid',
  already_used: 'Akun sudah dipakai orang lain',
  cant_login: 'Tidak bisa login',
  wrong_product: 'Produk salah kirim',
  other: 'Lainnya',
}

export const REASON_OPTIONS = [
  { value: 'cant_login', label: 'Tidak bisa login' },
  { value: 'account_invalid', label: 'Credentials tidak valid' },
  { value: 'already_used', label: 'Akun sudah dipakai orang lain' },
  { value: 'wrong_product', label: 'Produk salah kirim' },
  { value: 'other', label: 'Lainnya' },
] as const

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open: {
    label: 'Open',
    className: 'bg-warning/15 text-warning border-warning/40',
  },
  in_review: {
    label: 'Sedang Direview',
    className: 'bg-brand-50 text-brand-700 border-brand-200',
  },
  resolved_replaced: {
    label: 'Diganti',
    className: 'bg-success/15 text-success border-success/40',
  },
  resolved_refunded: {
    label: 'Direfund',
    className: 'bg-success/15 text-success border-success/40',
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-danger/15 text-danger border-danger/40',
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-ink-muted border-gray-300',
  },
}

export function TicketStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-ink-muted border-gray-300',
  }
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold whitespace-nowrap shrink-0 ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}
