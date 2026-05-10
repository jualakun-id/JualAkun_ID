'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

export function CouponForm() {
  const router = useRouter()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await api.post('/admin/coupons', {
      code,
      discount_type: discountType,
      discount_value: Number(discountValue),
      max_uses: maxUses ? Number(maxUses) : undefined,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    })
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal membuat kupon')
      return
    }
    toast.success(`Kupon ${code} berhasil dibuat ✓`)
    setCode('')
    setDiscountValue('')
    setMaxUses('')
    setExpiresAt('')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]"
    >
      <h3 className="font-heading text-xl font-extrabold tracking-tight">Buat Kupon</h3>
      <Field label="Kode">
        <Input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="font-mono uppercase"
          placeholder="HEMAT10"
        />
      </Field>
      <Field label="Tipe Diskon">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: 'percent', label: 'Persen (%)' },
            { v: 'fixed', label: 'Fixed (Rp)' },
          ].map((opt) => (
            <label
              key={opt.v}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 p-2.5 cursor-pointer transition-colors text-sm font-bold ${
                discountType === opt.v
                  ? 'border-brand-500 bg-brand-50 text-ink'
                  : 'border-black/15 bg-white text-ink-muted hover:border-brand-300'
              }`}
            >
              <input
                type="radio"
                checked={discountType === opt.v}
                onChange={() => setDiscountType(opt.v as 'percent' | 'fixed')}
                className="h-4 w-4 accent-brand-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Field>
      <Field label={discountType === 'percent' ? 'Persentase diskon (%)' : 'Nominal diskon (Rp)'}>
        <Input
          type="number"
          min={1}
          required
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder={discountType === 'percent' ? '10' : '50000'}
        />
      </Field>
      <Field label="Maks. pemakaian">
        <Input
          type="number"
          min={1}
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          placeholder="Kosongkan untuk unlimited"
        />
      </Field>
      <Field label="Berlaku hingga">
        <Input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </Field>
      <Button type="submit" loading={loading} size="lg" className="w-full">
        {loading ? 'Memproses...' : 'Buat Kupon'}
      </Button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-bold text-ink">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  )
}
