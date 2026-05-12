'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ShoppingBag, Coins, Users, TrendingUp, Shield, Mail, Phone, Calendar, Clock,
  Loader2, UserPlus, ShoppingCart, Wallet, CheckCircle2, RotateCcw, LifeBuoy,
  Tag, Star, Activity, ChevronRight,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTable } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/admin/status-badge'
import { UserStatusActions } from './user-status-actions'
import { AdjustCreditsForm } from './adjust-credits-form'
import { api } from '@/lib/api'
import { useToast } from '@/components/toast'
import { formatRupiah, formatDate, formatDateTime } from '@/lib/utils'

type UserDetail = {
  id: string
  full_name: string | null
  phone_wa: string | null
  role: 'user' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  credits: number
  joined_at: string
  referral_code: string | null
  referred_by: string | null
  email: string | null
  last_sign_in_at: string | null
  stats: {
    total_orders: number
    paid_orders: number
    total_spent: number
    referral_count: number
  }
  recent_orders: Array<{
    id: string
    order_number: string
    total_idr: number
    status: string
    created_at: string
    products: { name: string } | { name: string }[]
  }>
}

type TimelineEvent = {
  id: string
  event_type: string
  ref_id: string | null
  ref_table: string | null
  title: string
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type Props = {
  open: boolean
  userId: string | null
  onClose: () => void
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

function getDetailLink(e: TimelineEvent): string | null {
  if (!e.ref_id) return null
  if (e.ref_table === 'orders') return `/admin/pesanan/${e.ref_id}`
  if (e.ref_table === 'support_tickets') return `/admin/tiket/${e.ref_id}`
  return null
}

export function UserDetailModal({ open, userId, onClose }: Props) {
  const toast = useToast()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !userId) {
      setUser(null)
      setTimeline([])
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([
      api.get<UserDetail>(`/admin/users/${userId}`),
      api.get<TimelineEvent[]>(`/admin/users/${userId}/timeline`),
    ]).then(([userResult, timelineResult]) => {
      if (cancelled) return
      setLoading(false)
      if (!userResult.ok) {
        toast.error(userResult.message ?? 'Gagal memuat detail user')
        onClose()
        return
      }
      setUser(userResult.data)
      if (timelineResult.ok) setTimeline(timelineResult.data)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId])

  const statusTone = !user
    ? ''
    : user.status === 'active'
      ? 'bg-success/15 text-success border-success/40'
      : user.status === 'suspended'
        ? 'bg-warning/15 text-warning border-warning/40'
        : 'bg-danger/15 text-danger border-danger/40'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user?.full_name ?? user?.phone_wa ?? 'Detail Pengguna'}
      description={user?.email ?? (user ? '— belum verifikasi email —' : 'Memuat data...')}
      size="xl"
      rightSlot={
        user ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {user.role === 'admin' ? (
              <span className="inline-flex items-center gap-1 rounded-md border-2 border-brand-500 bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold text-brand-700">
                <Shield size={10} strokeWidth={2.5} />
                ADMIN
              </span>
            ) : null}
            <span className={`inline-flex items-center rounded-md border-2 px-2 py-0.5 text-[10px] font-bold capitalize ${statusTone}`}>
              {user.status}
            </span>
          </div>
        ) : null
      }
    >
      {loading || !user ? (
        <div className="flex items-center justify-center py-16 text-ink-muted">
          <Loader2 size={28} className="animate-spin text-brand-600" strokeWidth={2} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* KPI grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={<ShoppingBag size={18} strokeWidth={2.25} />}
              label="Total Order"
              value={user.stats.total_orders}
              subLabel={`${user.stats.paid_orders} bayar`}
            />
            <KpiCard
              icon={<TrendingUp size={18} strokeWidth={2.25} />}
              label="Pengeluaran"
              value={formatRupiah(user.stats.total_spent)}
              subLabel="dari yang bayar"
            />
            <KpiCard
              icon={<Coins size={18} strokeWidth={2.25} />}
              label="Saldo Kredit"
              value={formatRupiah(user.credits)}
              subLabel="bisa dipakai"
            />
            <KpiCard
              icon={<Users size={18} strokeWidth={2.25} />}
              label="Referral"
              value={user.stats.referral_count}
              subLabel="orang credited"
            />
          </div>

          {/* Profile + Adjust kredit */}
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-xl border-2 border-black/15 bg-brand-50/30 p-4">
              <h3 className="font-heading text-base font-extrabold tracking-tight">Profil</h3>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <InfoField icon={<Mail size={12} />} label="Email" value={user.email ?? '—'} />
                <InfoField
                  icon={<Phone size={12} />}
                  label="WhatsApp"
                  value={
                    user.phone_wa ? (
                      <a
                        href={`https://wa.me/${user.phone_wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-700 hover:underline font-mono"
                      >
                        {user.phone_wa}
                      </a>
                    ) : (
                      '—'
                    )
                  }
                />
                <InfoField
                  icon={<Coins size={12} />}
                  label="Kode Referral"
                  value={user.referral_code ? <code className="font-mono">{user.referral_code}</code> : '—'}
                />
                <InfoField icon={<Calendar size={12} />} label="Bergabung" value={formatDate(user.joined_at)} />
                <InfoField
                  icon={<Clock size={12} />}
                  label="Last Login"
                  value={user.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : 'Belum pernah'}
                />
                <InfoField icon={<Shield size={12} />} label="Di-refer Oleh" value={user.referred_by ?? '—'} />
              </dl>

              {user.role !== 'admin' ? <UserStatusActions userId={user.id} currentStatus={user.status} /> : null}
            </div>

            <div className="rounded-xl border-2 border-black/15 bg-brand-50/30 p-4">
              <h3 className="font-heading text-base font-extrabold tracking-tight">Adjust Kredit</h3>
              <p className="mt-1 text-[10px] text-ink-muted leading-snug">
                Tambah/kurangi saldo manual. Misal bonus referral atau kompensasi.
              </p>
              <AdjustCreditsForm userId={user.id} currentCredits={user.credits} />
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border-2 border-black/15 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-base font-extrabold tracking-tight">Timeline Aktivitas</h3>
              <span className="text-xs text-ink-muted font-bold">{timeline.length} event</span>
            </div>
            {timeline.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-4">Belum ada aktivitas tercatat.</p>
            ) : (
              <ol className="relative space-y-3 max-h-64 overflow-y-auto pr-2">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-200 via-brand-100 to-transparent" aria-hidden="true" />
                {timeline.map((e) => {
                  const cfg = EVENT_CONFIG[e.event_type] ?? { icon: Activity, tone: 'bg-gray-300 text-ink', label: e.event_type }
                  const Icon = cfg.icon
                  const href = getDetailLink(e)
                  const content = (
                    <div className="flex items-start gap-3">
                      <div className={`relative z-10 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-black ${cfg.tone} shadow-[0_2px_0_rgba(0,0,0,0.9)]`}>
                        <Icon size={14} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{cfg.label}</span>
                          <span className="text-[10px] tabular-nums text-ink-subtle whitespace-nowrap">{formatDateTime(e.created_at)}</span>
                        </div>
                        <div className="mt-0.5 flex items-start gap-1.5">
                          <span className="font-bold text-xs text-ink leading-snug">{e.title}</span>
                          {href ? <ChevronRight size={12} strokeWidth={2.5} className="mt-0.5 shrink-0 text-ink-subtle" /> : null}
                        </div>
                        {e.description ? <p className="mt-0.5 text-[11px] text-ink-muted line-clamp-2">{e.description}</p> : null}
                      </div>
                    </div>
                  )
                  return (
                    <li key={e.id} className="relative">
                      {href ? (
                        <Link href={href} onClick={onClose} className="block rounded-lg hover:bg-brand-50/50 p-1 -m-1 transition-colors">
                          {content}
                        </Link>
                      ) : (
                        <div className="p-1 -m-1">{content}</div>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}
          </div>

          {/* Recent orders */}
          <div>
            <h3 className="font-heading text-base font-extrabold tracking-tight mb-2">
              Riwayat Order ({user.recent_orders.length})
            </h3>
            <DataTable
              rows={user.recent_orders as unknown as Record<string, unknown>[]}
              emptyMessage="Belum ada order."
              columns={[
                {
                  key: 'order_number',
                  header: 'Order #',
                  render: (r) => {
                    const row = r as unknown as UserDetail['recent_orders'][number]
                    const product = Array.isArray(row.products) ? row.products[0] : row.products
                    return (
                      <Link href={`/admin/pesanan/${row.id}`} onClick={onClose} className="hover:text-brand-700">
                        <div className="font-mono text-xs">{row.order_number}</div>
                        <div className="mt-0.5 text-xs text-ink-subtle">{product?.name}</div>
                      </Link>
                    )
                  },
                },
                {
                  key: 'total_idr',
                  header: 'Total',
                  render: (r) => <span className="text-xs">{formatRupiah((r as unknown as UserDetail['recent_orders'][number]).total_idr)}</span>,
                  align: 'right',
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusBadge variant="order" status={(r as unknown as UserDetail['recent_orders'][number]).status} />,
                  align: 'center',
                },
                {
                  key: 'created_at',
                  header: 'Waktu',
                  render: (r) => <span className="text-xs tabular-nums">{formatDateTime((r as unknown as UserDetail['recent_orders'][number]).created_at)}</span>,
                },
              ]}
            />
          </div>
        </div>
      )}
    </Modal>
  )
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[10px] text-ink-muted font-bold uppercase tracking-wider">
        <span className="text-ink-subtle">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 text-ink font-medium break-all">{value}</dd>
    </div>
  )
}
