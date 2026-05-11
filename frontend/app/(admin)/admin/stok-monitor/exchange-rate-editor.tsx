'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightLeft, Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = {
  initialRate: number | null
}

/**
 * Card "Kurs Aktif" + modal edit. Update kurs hanya berlaku untuk fulfill
 * berikutnya (orders.cost_idr adalah snapshot historis, tidak terdistorsi).
 */
export function ExchangeRateEditor({ initialRate }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [rateInput, setRateInput] = useState(initialRate ? String(initialRate) : '')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const newRate = Number(rateInput)
    if (!Number.isFinite(newRate) || newRate <= 0) {
      toast.error('Kurs harus angka > 0')
      return
    }
    if (newRate < 10_000 || newRate > 50_000) {
      if (!confirm(`Kurs ${newRate.toLocaleString('id-ID')} di luar range wajar (10.000–50.000). Lanjutkan?`)) {
        return
      }
    }
    setSaving(true)
    const result = await api.patch<{ rate: number }>(`/admin/settings/exchange-rates/USD_IDR`, {
      rate: newRate,
      notes: notes.trim() || undefined,
    })
    setSaving(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal update kurs')
      return
    }
    toast.success(`Kurs USD-IDR di-update ke Rp ${newRate.toLocaleString('id-ID')} ✓`)
    setOpen(false)
    setNotes('')
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Klik untuk edit kurs. Perubahan hanya berlaku untuk fulfill berikutnya."
        className="flex flex-col gap-0.5 rounded-lg border-2 border-black bg-brand-50 px-3.5 py-2 text-sm font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all"
      >
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
          <ArrowRightLeft size={12} strokeWidth={2.5} />
          Kurs Aktif
          <Pencil size={10} strokeWidth={2.5} className="ml-0.5 opacity-60" />
        </span>
        <span className="text-base tabular-nums">
          {initialRate ? `Rp ${initialRate.toLocaleString('id-ID')}` : '—'} <span className="text-xs opacity-60">/ $1</span>
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        title="Update Kurs USD → IDR"
        description="Perubahan hanya berlaku untuk fulfill ke depan. Order yang sudah delivered tetap pakai kurs lama (cost_idr historis tidak berubah)."
        size="md"
        preventClose={saving}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="rate" className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Kurs Baru (Rupiah per 1 USD) <span className="text-danger">*</span>
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm font-bold text-ink-muted">Rp</span>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min={1}
                required
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                placeholder="18000"
                className="flex-1"
                disabled={saving}
              />
              <span className="text-sm font-bold text-ink-muted">/ $1</span>
            </div>
            <p className="mt-1.5 text-xs text-ink-subtle font-medium">
              Saat ini: <strong className="text-ink">Rp {initialRate?.toLocaleString('id-ID') ?? '—'}</strong>
              {rateInput && Number(rateInput) !== initialRate ? (
                <>
                  {' · '}Akan jadi: <strong className="text-brand-700">Rp {Number(rateInput).toLocaleString('id-ID')}</strong>
                </>
              ) : null}
            </p>
          </div>

          <div>
            <label htmlFor="notes" className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Catatan (opsional)
            </label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Naik karena USDT Binance jadi 18.500"
              className="mt-1.5"
              disabled={saving}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Kurs Baru'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
