'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

type Props = { ticketId: string; availableStockIds: string[] }

export function ResolveForm({ ticketId, availableStockIds }: Props) {
  const router = useRouter()
  const [resolutionType, setResolutionType] = useState<'replaced' | 'refunded' | 'rejected'>('replaced')
  const [stockId, setStockId] = useState(availableStockIds[0] ?? '')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
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
      setError(result.message ?? 'Gagal resolve')
      return
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-4">
      <fieldset>
        <legend className="text-sm font-medium text-text-muted">Pilih Resolusi</legend>
        <div className="mt-2 space-y-1.5">
          {[
            { v: 'replaced', l: `Kirim akun pengganti (${availableStockIds.length} stok tersedia)` },
            { v: 'refunded', l: 'Refund (manual transfer ke buyer)' },
            { v: 'rejected', l: 'Tolak (sertakan alasan)' },
          ].map((opt) => (
            <label key={opt.v} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="resolution"
                value={opt.v}
                checked={resolutionType === opt.v}
                onChange={() => setResolutionType(opt.v as typeof resolutionType)}
              />
              {opt.l}
            </label>
          ))}
        </div>
      </fieldset>

      {resolutionType === 'replaced' && availableStockIds.length > 0 ? (
        <div>
          <label className="text-sm font-medium text-text-muted">Pilih akun pengganti (FIFO)</label>
          <select
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text"
          >
            {availableStockIds.map((id, i) => (
              <option key={id} value={id}>#{i + 1} {id.slice(0, 8)}</option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label className="text-sm font-medium text-text-muted">Catatan admin</label>
        <textarea
          required
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Detail resolusi yang akan dikirim ke buyer..."
          className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm"
        />
      </div>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
      ) : null}

      <Button type="submit" disabled={loading}>
        {loading ? 'Memproses...' : 'Proses Resolusi'}
      </Button>
    </form>
  )
}
