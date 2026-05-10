'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

export function CouponForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
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
      setError(result.message ?? 'Gagal membuat kupon')
      return
    }
    setCode('')
    setDiscountValue('')
    setMaxUses('')
    setExpiresAt('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <h3 className="font-heading text-xl font-extrabold tracking-tight">Buat Kupon</h3>
      <Field label="Kode">
        <Input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono" />
      </Field>
      <Field label="Tipe">
        <div className="flex gap-3 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={discountType === 'percent'} onChange={() => setDiscountType('percent')} />
            Persen
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={discountType === 'fixed'} onChange={() => setDiscountType('fixed')} />
            Fixed (Rp)
          </label>
        </div>
      </Field>
      <Field label={discountType === 'percent' ? 'Persen (%)' : 'Nominal (Rp)'}>
        <Input type="number" min={1} required value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
      </Field>
      <Field label="Maks. pemakaian (opsional)">
        <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="kosong = ∞" />
      </Field>
      <Field label="Berlaku hingga (opsional)">
        <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </Field>
      {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div> : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Memproses...' : 'Buat Kupon'}
      </Button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-muted">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}
