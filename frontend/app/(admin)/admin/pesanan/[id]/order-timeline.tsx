import {
  Package,
  CreditCard,
  Hourglass,
  CheckCircle2,
  Send,
  Star,
  XCircle,
  Clock,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

type Props = {
  status: string
  createdAt: string
  paymentClaimedAt?: string | null
  paymentVerifiedAt?: string | null
  paidAt?: string | null
  deliveredAt?: string | null
  buyerConfirmedAt?: string | null
  paymentRejectedReason?: string | null
  expiresAt?: string | null
  reviewSubmittedAt?: string | null
  reviewRating?: number | null
}

type Step = {
  key: string
  label: string
  description?: string
  timestamp: string | null
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  state: 'done' | 'current' | 'pending' | 'cancelled'
}

/**
 * Order tracker timeline — visualisasi progres dari order dibuat sampai
 * confirmed, similar dengan cek resi shipping. Menggantikan "Log Notifikasi"
 * panel yang kurang useful (admin lebih sering butuh tau "sekarang di mana
 * progres-nya" daripada list notif).
 */
export function OrderTimeline(props: Props) {
  const {
    status,
    createdAt,
    paymentClaimedAt,
    paymentVerifiedAt,
    paidAt,
    deliveredAt,
    buyerConfirmedAt,
    paymentRejectedReason,
    expiresAt,
  } = props

  const isTerminalCancel = status === 'cancelled' || status === 'expired'
  const isRefunded = status === 'refunded'

  const steps: Step[] = [
    {
      key: 'created',
      label: 'Pesanan dibuat',
      description: 'Order masuk sistem, menunggu pembayaran',
      timestamp: createdAt,
      icon: Package,
      state: 'done',
    },
    {
      key: 'claimed',
      label: 'Buyer klaim sudah bayar',
      description: paymentClaimedAt
        ? 'Buyer transfer + klik "Saya sudah bayar"'
        : status === 'pending_payment'
          ? 'Menunggu buyer transfer + klaim'
          : '—',
      timestamp: paymentClaimedAt ?? null,
      icon: Hourglass,
      state: paymentClaimedAt
        ? 'done'
        : status === 'pending_payment'
          ? 'current'
          : isTerminalCancel
            ? 'cancelled'
            : 'pending',
    },
    {
      key: 'verified',
      label: 'Pembayaran diverifikasi',
      description: paymentVerifiedAt
        ? 'Admin cocokkan mutasi GoPay → konfirmasi'
        : status === 'verifying'
          ? 'Admin sedang cek mutasi'
          : status === 'cancelled' && paymentRejectedReason
            ? `Di-reject: ${paymentRejectedReason}`
            : '—',
      timestamp: paymentVerifiedAt ?? paidAt ?? null,
      icon: CreditCard,
      state: paymentVerifiedAt || paidAt
        ? 'done'
        : status === 'verifying'
          ? 'current'
          : isTerminalCancel
            ? 'cancelled'
            : 'pending',
    },
    {
      key: 'delivered',
      label: 'Akun dikirim ke buyer',
      description: deliveredAt
        ? 'Credentials ter-encrypt + notif WA + email'
        : status === 'paid'
          ? 'Admin perlu fulfill manual'
          : status === 'delivery_failed'
            ? 'Delivery gagal — perlu retry'
            : '—',
      timestamp: deliveredAt ?? null,
      icon: Send,
      state: deliveredAt
        ? 'done'
        : ['paid', 'delivery_failed'].includes(status)
          ? 'current'
          : isTerminalCancel
            ? 'cancelled'
            : 'pending',
    },
    {
      key: 'confirmed',
      label: 'Buyer konfirmasi terima',
      description: buyerConfirmedAt
        ? 'Buyer buka credentials → auto-konfirmasi'
        : status === 'delivered'
          ? 'Menunggu buyer buka credentials'
          : '—',
      timestamp: buyerConfirmedAt ?? null,
      icon: CheckCircle2,
      state: buyerConfirmedAt
        ? 'done'
        : status === 'delivered'
          ? 'current'
          : status === 'confirmed'
            ? 'done'
            : isTerminalCancel
              ? 'cancelled'
              : 'pending',
    },
    {
      key: 'review',
      label: 'Review diberikan buyer',
      description: props.reviewSubmittedAt
        ? `Buyer kasih ${props.reviewRating ?? '—'} bintang`
        : status === 'confirmed'
          ? 'Menunggu buyer kasih review'
          : '—',
      timestamp: props.reviewSubmittedAt ?? null,
      icon: Star,
      state: props.reviewSubmittedAt
        ? 'done'
        : status === 'confirmed'
          ? 'current'
          : isTerminalCancel
            ? 'cancelled'
            : 'pending',
    },
  ]

  // Tambah step refunded di akhir kalau status refunded
  if (isRefunded) {
    steps.push({
      key: 'refunded',
      label: 'Refund diproses',
      description: 'Dana dikembalikan ke buyer',
      timestamp: null,
      icon: XCircle,
      state: 'current',
    })
  }

  return (
    <div>
      <h2 className="font-heading text-lg font-extrabold tracking-tight flex items-center gap-2 mb-4">
        <Clock size={18} strokeWidth={2.5} className="text-brand-600" />
        Timeline Pesanan
      </h2>

      <ol className="relative space-y-0">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1
          const Icon = step.icon
          return (
            <li key={step.key} className="relative flex gap-3 pb-5">
              {/* Connector line ke step berikutnya */}
              {!isLast ? (
                <span
                  className={
                    step.state === 'done'
                      ? 'absolute left-[15px] top-7 h-full w-0.5 bg-success/60'
                      : 'absolute left-[15px] top-7 h-full w-0.5 bg-black/10 border-l-2 border-dashed border-black/15'
                  }
                  aria-hidden="true"
                />
              ) : null}

              {/* Icon bulat */}
              <div
                className={
                  step.state === 'done'
                    ? 'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-success shadow-[0_2px_0_rgba(0,0,0,0.9)]'
                    : step.state === 'current'
                      ? 'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-warning shadow-[0_2px_0_rgba(0,0,0,0.9)] animate-pulse'
                      : step.state === 'cancelled'
                        ? 'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-danger shadow-[0_2px_0_rgba(0,0,0,0.9)]'
                        : 'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black/15 bg-gray-100'
                }
                aria-hidden="true"
              >
                <Icon
                  size={14}
                  strokeWidth={2.75}
                  className={
                    step.state === 'done' || step.state === 'cancelled'
                      ? 'text-white'
                      : step.state === 'current'
                        ? 'text-ink'
                        : 'text-ink-subtle'
                  }
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span
                    className={
                      step.state === 'done'
                        ? 'text-sm font-extrabold text-ink'
                        : step.state === 'current'
                          ? 'text-sm font-extrabold text-warning'
                          : step.state === 'cancelled'
                            ? 'text-sm font-extrabold text-ink-muted line-through'
                            : 'text-sm font-bold text-ink-subtle'
                    }
                  >
                    {step.label}
                  </span>
                  {step.timestamp ? (
                    <span className="text-[11px] text-ink-muted font-medium">
                      {formatDateTime(step.timestamp)}
                    </span>
                  ) : step.state === 'current' ? (
                    <span className="text-[11px] text-warning font-bold">⏳ sekarang</span>
                  ) : null}
                </div>
                {step.description ? (
                  <p
                    className={
                      step.state === 'cancelled'
                        ? 'mt-0.5 text-[12px] text-danger leading-snug'
                        : 'mt-0.5 text-[12px] text-ink-muted leading-snug'
                    }
                  >
                    {step.description}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>

      {status === 'pending_payment' && expiresAt ? (
        <p className="mt-2 text-[11px] text-ink-subtle italic">
          Order kedaluwarsa: {formatDateTime(expiresAt)}
        </p>
      ) : null}

      {/* Pesanan selesai full flow (review masuk) */}
      {props.reviewSubmittedAt ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border-2 border-success/40 bg-success/5 px-3 py-2 text-xs text-success font-bold">
          <Star size={14} strokeWidth={2.5} />
          Pesanan selesai — siklus lengkap dengan review buyer
        </div>
      ) : null}
    </div>
  )
}
