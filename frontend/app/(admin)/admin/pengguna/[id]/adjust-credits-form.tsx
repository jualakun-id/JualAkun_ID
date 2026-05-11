'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Coins } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import { formatRupiah } from '@/lib/utils'

type Props = {
  userId: string
  currentCredits: number
}

export function AdjustCreditsForm({ userId, currentCredits }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [direction, setDirection] = useState<'add' | 'deduct'>('add')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(amount)
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Jumlah harus angka > 0')
      return
    }
    const delta = direction === 'add' ? n : -n
    const newBalance = Math.max(0, currentCredits + delta)
    if (!confirm(
      `Konfirmasi:\n${direction === 'add' ? '+ Tambah' : '- Kurangi'} ${formatRupiah(n)}\nSaldo sekarang: ${formatRupiah(currentCredits)}\nSaldo baru: ${formatRupiah(newBalance)}`,
    )) return
    setLoading(true)
    const result = await api.patch<{ previous: number; current: number; delta: number }>(
      `/admin/users/${userId}/credits`,
      { amount: delta, reason: reason.trim() || undefined },
    )
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal adjust kredit')
      return
    }
    toast.success(`Kredit di-update: ${formatRupiah(result.data.current)} ✓`)
    setAmount('')
    setReason('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="rounded-lg border-2 border-brand-200 bg-brand-50/40 px-3 py-2 text-sm">
        <span className="text-xs text-ink-muted font-bold uppercase tracking-wider block">Saldo Sekarang</span>
        <span className="font-heading font-extrabold text-lg text-brand-700 tabular-nums">{formatRupiah(currentCredits)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { v: 'add', label: 'Tambah', icon: Plus, tone: 'bg-success' },
          { v: 'deduct', label: 'Kurangi', icon: Minus, tone: 'bg-danger' },
        ].map((opt) => {
          const Icon = opt.icon
          const active = direction === opt.v
          return (
            <button
              type="button"
              key={opt.v}
              onClick={() => setDirection(opt.v as 'add' | 'deduct')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-bold transition-colors ${
                active ? `border-black ${opt.tone} text-white` : 'border-black/15 bg-white text-ink-muted hover:border-brand-300'
              }`}
            >
              <Icon size={14} strokeWidth={2.5} />
              {opt.label}
            </button>
          )
        })}
      </div>

      <div>
        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          Jumlah (Rp) <span className="text-danger">*</span>
        </label>
        <Input
          type="number"
          min={1}
          step={1000}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="50000"
          className="mt-1.5"
          disabled={loading}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          Alasan (opsional)
        </label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Bonus referral, kompensasi tiket"
          className="mt-1.5"
          disabled={loading}
        />
      </div>

      <Button type="submit" loading={loading} className="w-full inline-flex items-center justify-center gap-2">
        <Coins size={14} strokeWidth={2.5} />
        {loading ? 'Memproses...' : 'Simpan Adjustment'}
      </Button>
    </form>
  )
}
