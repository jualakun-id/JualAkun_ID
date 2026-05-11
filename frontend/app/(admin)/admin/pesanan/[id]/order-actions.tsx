'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { ConfirmButton } from '@/components/admin/confirm-button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = { orderId: string; status: string }

export function OrderActions({ orderId, status }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)

  async function refund() {
    const result = await api.patch(`/admin/orders/${orderId}/status`, { status: 'refunded' })
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal proses refund')
      return
    }
    toast.success('Refund berhasil diproses ✓')
    router.refresh()
  }

  async function markConfirmed() {
    if (!confirm('Mark order sebagai SELESAI?\n\nGunakan kalau buyer lupa konfirmasi setelah credentials diterima. Tindakan ini close window garansi normal.')) {
      return
    }
    setConfirming(true)
    const result = await api.post(`/admin/orders/${orderId}/confirm`)
    setConfirming(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal mark confirmed')
      return
    }
    toast.success('Order ditandai SELESAI ✓')
    router.refresh()
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {status === 'delivered' ? (
        <button
          type="button"
          onClick={markConfirmed}
          disabled={confirming}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-success px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {confirming ? <Loader2 size={14} className="animate-spin" strokeWidth={2.5} /> : <CheckCircle2 size={14} strokeWidth={2.5} />}
          Mark Selesai
        </button>
      ) : null}
      {!['refunded', 'expired'].includes(status) ? (
        <ConfirmButton
          label="Proses Refund"
          confirmTitle="Proses Refund?"
          confirmMessage="Order akan diubah status ke 'refunded'. Pastikan refund dana sudah/akan diproses ke buyer. Tindakan ini tidak bisa di-undo."
          confirmLabel="Ya, Refund"
          variant="danger"
          onConfirm={refund}
        />
      ) : null}
    </div>
  )
}
