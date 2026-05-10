'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = { ticketId: string; availableStockIds: string[] }

export function ResolveForm({ ticketId, availableStockIds }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [resolutionType, setResolutionType] = useState<'replaced' | 'refunded' | 'rejected'>('replaced')
  const [stockId, setStockId] = useState(availableStockIds[0] ?? '')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const status =
      resolutionType === 'replaced' ? 'resolved_replaced' :
      resolutionType === 'refunded' ? 'resolved_refunded' : 'rejected'
    const result = await api.patch(`/admin/tickets/${ticketId}`, {
      status,
      resolution: note,
      new_account_stock_id: resolutionType === 'replaced' ? stockId : undefined,
    })
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal proses resolusi')
      return
    }
    const successMsg =
      resolutionType === 'replaced' ? 'Akun pengganti berhasil dikirim ✓' :
      resolutionType === 'refunded' ? 'Refund berhasil diproses ✓' : 'Tiket ditolak ✓'
    toast.success(successMsg)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-5">
      <fieldset>
        <legend className="text-sm font-bold text-ink">Pilih Resolusi</legend>
        <div className="mt-2.5 space-y-2">
          {[
            { v: 'replaced', l: `Kirim akun pengganti (${availableStockIds.length} stok tersedia)` },
            { v: 'refunded', l: 'Refund (manual transfer ke buyer)' },
            { v: 'rejected', l: 'Tolak (sertakan alasan)' },
          ].map((opt) => (
            <label
              key={opt.v}
              className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors text-sm font-medium ${
                resolutionType === opt.v
                  ? 'border-brand-500 bg-brand-50 text-ink'
                  : 'border-black/15 bg-white text-ink-muted hover:border-brand-300'
              }`}
            >
              <input
                type="radio"
                name="resolution"
                value={opt.v}
                checked={resolutionType === opt.v}
                onChange={() => setResolutionType(opt.v as typeof resolutionType)}
                className="h-4 w-4 accent-brand-500"
              />
              {opt.l}
            </label>
          ))}
        </div>
      </fieldset>

      {resolutionType === 'replaced' && availableStockIds.length > 0 ? (
        <div>
          <label className="text-sm font-bold text-ink">Pilih akun pengganti (FIFO)</label>
          <select
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            className="mt-2 w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          >
            {availableStockIds.map((id, i) => (
              <option key={id} value={id}>#{i + 1} {id.slice(0, 8)}</option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label className="text-sm font-bold text-ink">Catatan untuk buyer</label>
        <textarea
          required
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Detail resolusi yang akan dikirim ke buyer..."
          className="mt-2 w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        />
      </div>

      <Button type="submit" loading={loading} size="lg">
        {loading ? 'Memproses...' : 'Proses Resolusi'}
      </Button>
    </form>
  )
}
