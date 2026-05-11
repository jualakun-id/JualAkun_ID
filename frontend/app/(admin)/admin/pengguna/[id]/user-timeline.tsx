import Link from 'next/link'
import {
  UserPlus, ShoppingCart, Wallet, CheckCircle2, RotateCcw, Clock, LifeBuoy,
  Tag, Star, Coins, Activity, ChevronRight,
} from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { formatDateTime } from '@/lib/utils'

type EventType =
  | 'user_registered'
  | 'order_created' | 'order_paid' | 'order_delivered' | 'order_refunded' | 'order_expired'
  | 'ticket_created' | 'ticket_resolved'
  | 'coupon_used' | 'review_submitted'
  | 'referral_redeemed' | 'referral_credited'
  | string

type TimelineEvent = {
  id: string
  event_type: EventType
  ref_id: string | null
  ref_table: string | null
  title: string
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

const EVENT_CONFIG: Record<string, { icon: typeof UserPlus; tone: string; label: string }> = {
  user_registered: { icon: UserPlus, tone: 'bg-success text-white', label: 'Daftar' },
  order_created: { icon: ShoppingCart, tone: 'bg-brand-500 text-ink', label: 'Order Baru' },
  order_paid: { icon: Wallet, tone: 'bg-warning text-ink', label: 'Pembayaran' },
  order_delivered: { icon: CheckCircle2, tone: 'bg-success text-white', label: 'Dikirim' },
  order_refunded: { icon: RotateCcw, tone: 'bg-danger text-white', label: 'Refund' },
  order_expired: { icon: Clock, tone: 'bg-gray-400 text-white', label: 'Expired' },
  ticket_created: { icon: LifeBuoy, tone: 'bg-warning text-ink', label: 'Tiket Baru' },
  ticket_resolved: { icon: CheckCircle2, tone: 'bg-success text-white', label: 'Tiket Resolved' },
  coupon_used: { icon: Tag, tone: 'bg-brand-500 text-ink', label: 'Pakai Kupon' },
  review_submitted: { icon: Star, tone: 'bg-warning text-ink', label: 'Review' },
  referral_redeemed: { icon: Coins, tone: 'bg-brand-500 text-ink', label: 'Pakai Kredit' },
  referral_credited: { icon: Coins, tone: 'bg-success text-white', label: 'Kredit Masuk' },
}

function getDetailLink(event: TimelineEvent): string | null {
  if (!event.ref_id) return null
  if (event.ref_table === 'orders') return `/admin/pesanan/${event.ref_id}`
  if (event.ref_table === 'support_tickets') return `/admin/tiket/${event.ref_id}`
  return null
}

export async function UserTimeline({ userId }: { userId: string }) {
  const events = await adminFetch<TimelineEvent[]>(`/admin/users/${userId}/timeline`)

  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Timeline Aktivitas</h2>
        <p className="mt-4 text-sm text-ink-muted text-center py-6">
          Belum ada aktivitas tercatat untuk user ini.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Timeline Aktivitas</h2>
        <span className="text-xs text-ink-muted font-bold">{events.length} event</span>
      </div>

      <ol className="relative space-y-3">
        {/* Vertical line connector */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-200 via-brand-100 to-transparent" aria-hidden="true" />

        {events.map((e) => {
          const cfg = EVENT_CONFIG[e.event_type] ?? { icon: Activity, tone: 'bg-gray-300 text-ink', label: e.event_type }
          const Icon = cfg.icon
          const href = getDetailLink(e)
          const content = (
            <div className="flex items-start gap-3 group">
              {/* Icon badge — sticker style */}
              <div className={`relative z-10 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-black ${cfg.tone} shadow-[0_2px_0_rgba(0,0,0,0.9)]`}>
                <Icon size={14} strokeWidth={2.5} />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{cfg.label}</span>
                  <span className="text-[10px] tabular-nums text-ink-subtle whitespace-nowrap">
                    {formatDateTime(e.created_at)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-start gap-1.5">
                  <span className="font-bold text-sm text-ink leading-snug">{e.title}</span>
                  {href ? (
                    <ChevronRight
                      size={14}
                      strokeWidth={2.5}
                      className="mt-0.5 shrink-0 text-ink-subtle group-hover:text-brand-700 transition-colors"
                    />
                  ) : null}
                </div>
                {e.description ? (
                  <p className="mt-0.5 text-xs text-ink-muted line-clamp-2">{e.description}</p>
                ) : null}
              </div>
            </div>
          )

          return (
            <li key={e.id} className="relative">
              {href ? (
                <Link href={href} className="block rounded-lg hover:bg-brand-50/50 p-1 -m-1 transition-colors">
                  {content}
                </Link>
              ) : (
                <div className="p-1 -m-1">{content}</div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
