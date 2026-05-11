'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UserPlus, Wallet, Package, RotateCcw, LifeBuoy, CheckCircle2,
  Activity, Eye, Circle, Loader2,
  Clock, Tag, Star, AlertTriangle, ShoppingCart, AlertCircle, Coins, MailWarning, PackagePlus,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { DataTable, type SortDir } from '@/components/admin/data-table'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import { formatDateTime, formatRupiah } from '@/lib/utils'

type EventType =
  | 'user_registered'
  | 'order_created' | 'order_paid' | 'order_delivered' | 'order_refunded' | 'order_expired'
  | 'ticket_created' | 'ticket_resolved'
  | 'coupon_used' | 'coupon_created' | 'coupon_deactivated'
  | 'review_submitted'
  | 'stock_critical' | 'stock_out'
  | 'supplier_purchase' | 'supplier_low_balance'
  | 'referral_credited' | 'referral_redeemed'
  | 'notification_failed'
  | 'product_created'

type ActivityRow = {
  id: string
  event_type: EventType
  ref_id: string | null
  ref_table: string | null
  title: string
  description: string | null
  metadata: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

type DetailResponse = ActivityRow & { ref_data: Record<string, unknown> | null }

const EVENT_CONFIG: Record<EventType, { icon: typeof UserPlus; label: string; tone: string }> = {
  user_registered: { icon: UserPlus, label: 'User Baru', tone: 'bg-success/10 text-success border-success/40' },
  order_created: { icon: ShoppingCart, label: 'Order Baru', tone: 'bg-brand-50 text-brand-700 border-brand-200' },
  order_paid: { icon: Wallet, label: 'Pembayaran', tone: 'bg-warning/10 text-warning border-warning/40' },
  order_delivered: { icon: CheckCircle2, label: 'Pengiriman', tone: 'bg-success/10 text-success border-success/40' },
  order_refunded: { icon: RotateCcw, label: 'Refund', tone: 'bg-danger/10 text-danger border-danger/40' },
  order_expired: { icon: Clock, label: 'Expired', tone: 'bg-gray-100 text-ink-muted border-gray-200' },
  ticket_created: { icon: LifeBuoy, label: 'Tiket Baru', tone: 'bg-warning/10 text-warning border-warning/40' },
  ticket_resolved: { icon: CheckCircle2, label: 'Tiket Resolved', tone: 'bg-success/10 text-success border-success/40' },
  coupon_used: { icon: Tag, label: 'Kupon Dipakai', tone: 'bg-brand-50 text-brand-700 border-brand-200' },
  coupon_created: { icon: Tag, label: 'Kupon Dibuat', tone: 'bg-success/10 text-success border-success/40' },
  coupon_deactivated: { icon: Tag, label: 'Kupon Disable', tone: 'bg-gray-100 text-ink-muted border-gray-200' },
  review_submitted: { icon: Star, label: 'Review', tone: 'bg-warning/10 text-warning border-warning/40' },
  stock_critical: { icon: AlertTriangle, label: 'Stok Kritis', tone: 'bg-warning/10 text-warning border-warning/40' },
  stock_out: { icon: AlertCircle, label: 'Stok Habis', tone: 'bg-danger/10 text-danger border-danger/40' },
  supplier_purchase: { icon: ShoppingCart, label: 'Beli Supplier', tone: 'bg-brand-50 text-brand-700 border-brand-200' },
  supplier_low_balance: { icon: AlertTriangle, label: 'Saldo Supplier', tone: 'bg-danger/10 text-danger border-danger/40' },
  referral_credited: { icon: Coins, label: 'Kredit Referral', tone: 'bg-success/10 text-success border-success/40' },
  referral_redeemed: { icon: Coins, label: 'Kredit Dipakai', tone: 'bg-brand-50 text-brand-700 border-brand-200' },
  notification_failed: { icon: MailWarning, label: 'Notif Gagal', tone: 'bg-danger/10 text-danger border-danger/40' },
  product_created: { icon: PackagePlus, label: 'Produk Baru', tone: 'bg-success/10 text-success border-success/40' },
}

type Props = {
  rows: ActivityRow[]
  sortBy: string | null
  sortDir: SortDir
  sortBasePath: string
}

export function ActivityFeedClient({ rows, sortBy, sortDir, sortBasePath }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [openId, setOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  async function handleOpen(id: string) {
    setOpenId(id)
    setLoadingDetail(true)
    setDetail(null)
    const result = await api.get<DetailResponse>(`/admin/activity-log/${id}`)
    setLoadingDetail(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal load detail')
      setOpenId(null)
      return
    }
    setDetail(result.data)
    // Auto-mark as read (fire-and-forget)
    api.patch(`/admin/activity-log/${id}/read`).then(() => router.refresh())
  }

  function handleClose() {
    setOpenId(null)
    setDetail(null)
  }

  async function handleMarkAllRead() {
    const result = await api.post(`/admin/activity-log/mark-all-read`)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal mark all read')
      return
    }
    toast.success('Semua notifikasi ditandai sudah dibaca ✓')
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-brand-700 hover:underline"
        >
          <Eye size={14} strokeWidth={2.5} />
          Tandai semua sudah dibaca
        </button>
      </div>

      <DataTable
        rows={rows as unknown as Record<string, unknown>[]}
        rowClassName={(r) =>
          `cursor-pointer ${!(r as unknown as ActivityRow).is_read ? 'bg-brand-50/30 font-bold' : ''}`
        }
        sortBy={sortBy}
        sortDir={sortDir}
        sortBasePath={sortBasePath}
        emptyMessage="Belum ada aktivitas — event akan muncul setelah ada user daftar/pembayaran/pengiriman."
        columns={[
          {
            key: 'unread',
            header: '',
            render: (r) => {
              const row = r as unknown as ActivityRow
              return row.is_read ? null : (
                <Circle size={8} strokeWidth={0} className="fill-brand-500" aria-label="Belum dibaca" />
              )
            },
            align: 'center',
            className: 'w-6',
          },
          {
            key: 'event_type',
            header: 'Tipe',
            render: (r) => {
              const row = r as unknown as ActivityRow
              const cfg = EVENT_CONFIG[row.event_type] ?? {
                icon: Activity,
                label: row.event_type,
                tone: 'bg-gray-100 text-ink-muted border-gray-200',
              }
              const Icon = cfg.icon
              return (
                <button
                  type="button"
                  onClick={() => handleOpen(row.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold ${cfg.tone}`}
                >
                  <Icon size={12} strokeWidth={2.5} />
                  {cfg.label}
                </button>
              )
            },
          },
          {
            key: 'title',
            header: 'Aktivitas',
            render: (r) => {
              const row = r as unknown as ActivityRow
              return (
                <button
                  type="button"
                  onClick={() => handleOpen(row.id)}
                  className="text-left hover:text-brand-700 transition-colors"
                >
                  <div className="text-ink">{row.title}</div>
                  {row.description ? (
                    <div className="text-xs text-ink-subtle font-normal line-clamp-1 mt-0.5">
                      {row.description}
                    </div>
                  ) : null}
                </button>
              )
            },
          },
          {
            key: 'created_at',
            header: 'Waktu',
            render: (r) => (
              <span className="text-xs tabular-nums text-ink-muted">
                {formatDateTime((r as unknown as ActivityRow).created_at)}
              </span>
            ),
            align: 'right',
            className: 'w-44',
          },
        ]}
      />

      <Modal
        open={openId !== null}
        onClose={handleClose}
        title={detail ? (EVENT_CONFIG[detail.event_type]?.label ?? 'Detail Aktivitas') : 'Memuat...'}
        description={detail?.title}
        size="md"
      >
        {loadingDetail || !detail ? (
          <div className="flex items-center justify-center py-12 text-ink-muted">
            <Loader2 size={28} className="animate-spin text-brand-600" strokeWidth={2} />
          </div>
        ) : (
          <ActivityDetail detail={detail} onClose={handleClose} />
        )}
      </Modal>
    </>
  )
}

function ActivityDetail({ detail, onClose }: { detail: DetailResponse; onClose: () => void }) {
  const cfg = EVENT_CONFIG[detail.event_type]
  const Icon = cfg?.icon ?? Activity

  // Build link ke entity terkait
  let detailHref: string | null = null
  if (detail.ref_table === 'orders' && detail.ref_id) {
    detailHref = `/admin/pesanan/${detail.ref_id}`
  } else if (detail.ref_table === 'support_tickets' && detail.ref_id) {
    detailHref = `/admin/tiket/${detail.ref_id}`
  } else if (detail.ref_table === 'profiles' && detail.ref_id) {
    detailHref = `/admin/pengguna`
  }

  return (
    <div className="space-y-4">
      <div className={`inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-extrabold ${cfg?.tone ?? ''}`}>
        <Icon size={16} strokeWidth={2.5} />
        {cfg?.label ?? detail.event_type}
      </div>

      {detail.description ? (
        <p className="text-sm text-ink leading-relaxed">{detail.description}</p>
      ) : null}

      <div className="rounded-lg border border-black/10 bg-brand-50/30 p-3 space-y-1 text-xs">
        <div className="flex justify-between gap-3">
          <span className="text-ink-muted font-bold">Waktu</span>
          <span className="text-ink tabular-nums">{formatDateTime(detail.created_at)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-ink-muted font-bold">Status</span>
          <span className="text-ink">{detail.is_read ? 'Sudah dibaca' : 'Baru'}</span>
        </div>
        {detail.ref_id ? (
          <div className="flex justify-between gap-3">
            <span className="text-ink-muted font-bold">Ref ID</span>
            <code className="text-[10px] text-ink-subtle">{detail.ref_id.slice(0, 8)}</code>
          </div>
        ) : null}
      </div>

      {detail.ref_data ? <RefDataPanel data={detail.ref_data} table={detail.ref_table} /> : null}

      <div className="flex flex-wrap gap-2 pt-2">
        {detailHref ? (
          <Link
            href={detailHref}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-brand-500 px-4 py-2 text-sm font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all"
          >
            Buka detail →
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all"
        >
          Tutup
        </button>
      </div>
    </div>
  )
}

function RefDataPanel({ data, table }: { data: Record<string, unknown>; table: string | null }) {
  if (!data) return null

  if (table === 'orders') {
    const o = data as { order_number?: string; total_idr?: number; status?: string; products?: { name?: string } | { name?: string }[] }
    const product = Array.isArray(o.products) ? o.products[0] : o.products
    return (
      <div className="rounded-lg border-2 border-brand-200 bg-brand-50/40 p-3 space-y-1.5 text-sm">
        <div className="font-heading font-extrabold text-ink">{o.order_number}</div>
        <div className="text-xs text-ink-muted">{product?.name ?? '—'}</div>
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-ink-muted">Total</span>
          <span className="font-bold text-ink">{formatRupiah(o.total_idr ?? 0)}</span>
        </div>
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-ink-muted">Status</span>
          <span className="uppercase font-bold text-brand-700">{o.status ?? '—'}</span>
        </div>
      </div>
    )
  }

  if (table === 'profiles') {
    const p = data as { full_name?: string; phone_wa?: string; role?: string }
    return (
      <div className="rounded-lg border-2 border-brand-200 bg-brand-50/40 p-3 space-y-1.5 text-sm">
        <div className="font-heading font-extrabold text-ink">{p.full_name ?? 'User'}</div>
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-ink-muted">WhatsApp</span>
          <span className="font-mono text-ink">{p.phone_wa ?? '—'}</span>
        </div>
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-ink-muted">Role</span>
          <span className="uppercase font-bold text-brand-700">{p.role ?? '—'}</span>
        </div>
      </div>
    )
  }

  if (table === 'support_tickets') {
    const t = data as { reason?: string; status?: string; description?: string; resolution?: string }
    return (
      <div className="rounded-lg border-2 border-brand-200 bg-brand-50/40 p-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-ink-muted">Alasan</span>
          <span className="uppercase font-bold text-ink">{t.reason ?? '—'}</span>
        </div>
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-ink-muted">Status</span>
          <span className="uppercase font-bold text-brand-700">{t.status ?? '—'}</span>
        </div>
        {t.description ? (
          <div className="pt-1 text-xs text-ink-muted">
            <div className="font-bold mb-0.5">Deskripsi:</div>
            {t.description}
          </div>
        ) : null}
        {t.resolution ? (
          <div className="pt-1 text-xs text-ink-muted">
            <div className="font-bold mb-0.5">Resolusi:</div>
            {t.resolution}
          </div>
        ) : null}
      </div>
    )
  }

  return null
}
