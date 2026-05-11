'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import { ProductMultiSelect } from './product-multi-select'

type InitialData = {
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  expires_at: string | null
  valid_for_products: string[] | null
}

function isoToLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const off = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - off).toISOString().slice(0, 16)
}

export function CouponForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const dupId = searchParams.get('dup')

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [validForProducts, setValidForProducts] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [prefillLoading, setPrefillLoading] = useState(false)

  // Prefill dari ?dup=<id> untuk Duplicate flow
  useEffect(() => {
    if (!dupId) return
    let cancelled = false
    setPrefillLoading(true)
    api.get<InitialData & { code: string }>(`/admin/coupons/${dupId}`).then((result) => {
      if (cancelled) return
      setPrefillLoading(false)
      if (!result.ok) return
      // Kode KOSONG — biar admin masukkan kode baru (UNIQUE constraint)
      setDiscountType(result.data.discount_type)
      setDiscountValue(String(result.data.discount_value))
      setMaxUses(result.data.max_uses?.toString() ?? '')
      setExpiresAt(isoToLocal(result.data.expires_at))
      setValidForProducts(result.data.valid_for_products ?? null)
      toast.info(`Form di-prefill dari "${result.data.code}". Masukkan kode baru.`)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dupId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await api.post('/admin/coupons', {
      code,
      discount_type: discountType,
      discount_value: Number(discountValue),
      max_uses: maxUses ? Number(maxUses) : undefined,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      valid_for_products: validForProducts ?? undefined,
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
    setValidForProducts(null)
    // Hapus ?dup= dari URL setelah submit
    if (dupId) router.replace('/admin/kupon')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl font-extrabold tracking-tight">
          {dupId ? 'Duplicate Kupon' : 'Buat Kupon'}
        </h3>
        {dupId ? (
          <button
            type="button"
            onClick={() => router.replace('/admin/kupon')}
            className="text-xs font-bold text-ink-muted hover:text-brand-700 underline"
          >
            Reset
          </button>
        ) : null}
      </div>

      {prefillLoading ? (
        <p className="text-xs text-ink-muted italic">Memuat data duplicate...</p>
      ) : null}

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
      <Field label="Produk yang berlaku">
        <ProductMultiSelect value={validForProducts} onChange={setValidForProducts} disabled={loading} />
      </Field>
      <Button type="submit" loading={loading} size="lg" className="w-full">
        {loading ? 'Memproses...' : dupId ? 'Buat Duplicate' : 'Buat Kupon'}
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
