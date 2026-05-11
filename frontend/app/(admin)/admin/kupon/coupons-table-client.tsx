'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Pencil, Power, Loader2 } from 'lucide-react'
import { DataTable, type SortDir } from '@/components/admin/data-table'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import { formatRupiah, formatDate } from '@/lib/utils'
import { EditCouponModal } from './edit-coupon-modal'

type Coupon = {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

type CombinedStatus = 'aktif' | 'expired' | 'exhausted' | 'nonaktif'

function computeStatus(c: Coupon): CombinedStatus {
  if (!c.is_active) return 'nonaktif'
  if (c.expires_at && new Date(c.expires_at) < new Date()) return 'expired'
  if (c.max_uses !== null && c.used_count >= c.max_uses) return 'exhausted'
  return 'aktif'
}

const STATUS_CONFIG: Record<CombinedStatus, { label: string; tone: string }> = {
  aktif: { label: 'Aktif', tone: 'bg-success/15 text-success border-success/40' },
  expired: { label: 'Expired', tone: 'bg-warning/15 text-warning border-warning/40' },
  exhausted: { label: 'Habis', tone: 'bg-warning/15 text-warning border-warning/40' },
  nonaktif: { label: 'Nonaktif', tone: 'bg-gray-100 text-ink-muted border-gray-300' },
}

type Props = {
  coupons: Coupon[]
  sortBy: string | null
  sortDir: SortDir
  sortBasePath: string
}

export function CouponsTableClient({ coupons, sortBy, sortDir, sortBasePath }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code)
    toast.success(`Kode "${code}" disalin ✓`)
  }

  async function handleDeactivate(c: Coupon) {
    if (!confirm(`Nonaktifkan kupon ${c.code}?\n\nBuyer tidak akan bisa pakai kupon ini lagi. Tindakan ini bisa di-undo lewat tombol Edit.`)) return
    setDeactivatingId(c.id)
    const result = await api.delete(`/admin/coupons/${c.id}`)
    setDeactivatingId(null)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal deactivate kupon')
      return
    }
    toast.success(`Kupon ${c.code} di-nonaktifkan ✓`)
    router.refresh()
  }

  return (
    <>
      <DataTable
        rows={coupons as unknown as Record<string, unknown>[]}
        sortBy={sortBy}
        sortDir={sortDir}
        sortBasePath={sortBasePath}
        emptyMessage="Belum ada kupon. Buat kupon baru lewat form di samping."
        columns={[
          {
            key: 'code',
            header: 'Kode',
            sortKey: 'code',
            render: (r) => {
              const c = r as unknown as Coupon
              return (
                <button
                  type="button"
                  onClick={() => handleCopy(c.code)}
                  title="Klik untuk salin"
                  className="inline-flex items-center gap-1.5 font-mono font-bold text-ink hover:text-brand-700"
                >
                  {c.code}
                  <Copy size={11} strokeWidth={2.5} className="opacity-50" />
                </button>
              )
            },
          },
          {
            key: 'discount_value',
            header: 'Diskon',
            sortKey: 'discount_value',
            render: (r) => {
              const c = r as unknown as Coupon
              return (
                <span className="font-bold text-ink">
                  {c.discount_type === 'percent' ? `${c.discount_value}%` : formatRupiah(c.discount_value)}
                </span>
              )
            },
            align: 'right',
          },
          {
            key: 'used_count',
            header: 'Pemakaian',
            sortKey: 'used_count',
            render: (r) => {
              const c = r as unknown as Coupon
              const max = c.max_uses ?? '∞'
              const pct = c.max_uses ? Math.round((c.used_count / c.max_uses) * 100) : 0
              return (
                <div className="text-xs">
                  <div className="font-bold tabular-nums text-ink">{c.used_count} / {max}</div>
                  {c.max_uses ? <div className="text-ink-subtle">{pct}%</div> : null}
                </div>
              )
            },
            align: 'right',
          },
          {
            key: 'expires_at',
            header: 'Berlaku Hingga',
            sortKey: 'expires_at',
            render: (r) => {
              const c = r as unknown as Coupon
              return (
                <span className="text-xs">
                  {c.expires_at ? formatDate(c.expires_at) : <span className="text-ink-subtle italic">tanpa batas</span>}
                </span>
              )
            },
          },
          {
            key: 'created_at',
            header: 'Dibuat',
            sortKey: 'created_at',
            render: (r) => (
              <span className="text-xs tabular-nums text-ink-muted">
                {formatDate((r as unknown as Coupon).created_at)}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            sortKey: 'is_active',
            render: (r) => {
              const c = r as unknown as Coupon
              const status = computeStatus(c)
              const cfg = STATUS_CONFIG[status]
              return (
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${cfg.tone}`}>
                  {cfg.label}
                </span>
              )
            },
            align: 'center',
          },
          {
            key: 'action',
            header: '',
            render: (r) => {
              const c = r as unknown as Coupon
              const isDeactivating = deactivatingId === c.id
              return (
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingId(c.id)}
                    title="Edit kupon"
                    className="inline-flex items-center rounded-md border-2 border-brand-200 bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100"
                  >
                    <Pencil size={11} strokeWidth={2.5} />
                  </button>
                  {c.is_active ? (
                    <button
                      type="button"
                      onClick={() => handleDeactivate(c)}
                      disabled={isDeactivating}
                      title="Nonaktifkan kupon"
                      className="inline-flex items-center rounded-md border-2 border-danger/40 bg-danger/10 px-2 py-1 text-xs font-bold text-danger hover:bg-danger/15 disabled:opacity-50"
                    >
                      {isDeactivating ? <Loader2 size={11} className="animate-spin" strokeWidth={2.5} /> : <Power size={11} strokeWidth={2.5} />}
                    </button>
                  ) : null}
                </div>
              )
            },
            align: 'right',
          },
        ]}
      />

      <EditCouponModal
        open={editingId !== null}
        couponId={editingId}
        onClose={() => setEditingId(null)}
      />
    </>
  )
}
