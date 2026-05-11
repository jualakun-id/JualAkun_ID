'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Coupon = {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
}

type Props = {
  open: boolean
  couponId: string | null
  onClose: () => void
}

function isoToLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const off = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - off).toISOString().slice(0, 16)
}

export function EditCouponModal({ open, couponId, onClose }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [discountValue, setDiscountValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!open || !couponId) {
      setCoupon(null)
      return
    }
    let cancelled = false
    setLoading(true)
    api.get<Coupon>(`/admin/coupons/${couponId}`).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        toast.error(result.message ?? 'Gagal load kupon')
        onClose()
        return
      }
      setCoupon(result.data)
      setDiscountValue(String(result.data.discount_value))
      setMaxUses(result.data.max_uses?.toString() ?? '')
      setExpiresAt(isoToLocal(result.data.expires_at))
      setIsActive(result.data.is_active)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, couponId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!coupon) return
    setSaving(true)
    const result = await api.patch(`/admin/coupons/${coupon.id}`, {
      discount_value: Number(discountValue),
      max_uses: maxUses ? Number(maxUses) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    })
    setSaving(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal update kupon')
      return
    }
    toast.success(`Kupon ${coupon.code} di-update ✓`)
    router.refresh()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title={coupon ? `Edit Kupon: ${coupon.code}` : 'Memuat...'}
      description={coupon ? `Sudah dipakai ${coupon.used_count} kali` : ''}
      size="md"
      preventClose={saving}
    >
      {loading || !coupon ? (
        <div className="flex items-center justify-center py-12 text-ink-muted">
          <Loader2 size={28} className="animate-spin text-brand-600" strokeWidth={2} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Nilai Diskon ({coupon.discount_type === 'percent' ? '%' : 'Rp'}) <span className="text-danger">*</span>
            </label>
            <Input
              type="number"
              min={1}
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="mt-1.5"
              disabled={saving}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Maksimal Pemakaian
            </label>
            <Input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Kosongkan untuk unlimited"
              className="mt-1.5"
              disabled={saving}
            />
            <p className="mt-1 text-xs text-ink-subtle">Sudah dipakai: <strong>{coupon.used_count}</strong> kali</p>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Berlaku Hingga
            </label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1.5"
              disabled={saving}
            />
            <p className="mt-1 text-xs text-ink-subtle">Kosongkan = tanpa batas</p>
          </div>

          <label className="flex items-start gap-3 rounded-lg border-2 border-black/15 bg-brand-50/40 p-3 cursor-pointer hover:border-brand-400 transition-colors">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-500 cursor-pointer"
              disabled={saving}
            />
            <span className="flex-1">
              <span className="text-sm font-bold text-ink block">Kupon Aktif</span>
              <span className="text-xs text-ink-muted block mt-0.5">Buyer bisa pakai kalau dicentang</span>
            </span>
          </label>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" loading={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Batal
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
