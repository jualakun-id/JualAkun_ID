'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { ConfirmButton } from '@/components/admin/confirm-button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = {
  orderId: string
  status: string
  totalIdr?: number
  uniqueSuffix?: number | null
}

export function OrderActions({ orderId, status, totalIdr, uniqueSuffix }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)
  const [verifying, setVerifying] = useState(false)

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

  async function verifyPayment() {
    const amountStr = totalIdr ? `Rp ${totalIdr.toLocaleString('id-ID')}` : 'amount sesuai'
    if (!confirm(`Konfirmasi pembayaran ${amountStr} sudah masuk di GoPay Saya?\n\nPastikan Anda sudah cek mutasi dan amount cocok.`)) return
    setVerifying(true)
    const result = await api.post(`/admin/orders/${orderId}/verify-payment`)
    setVerifying(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal verify pembayaran')
      return
    }
    toast.success('Pembayaran terverifikasi ✓ Order ready untuk fulfill.')
    router.refresh()
  }

  async function rejectPayment() {
    const reason = prompt('Alasan reject pembayaran (akan dikirim ke buyer):', 'Pembayaran tidak ditemukan di mutasi GoPay setelah dicek.')
    if (!reason || reason.trim().length < 3) {
      if (reason !== null) toast.error('Alasan minimal 3 karakter')
      return
    }
    const result = await api.post(`/admin/orders/${orderId}/reject-payment`, { reason: reason.trim() })
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal reject pembayaran')
      return
    }
    toast.success('Pembayaran di-reject. Buyer dapat notif.')
    router.refresh()
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {/* Verify / Reject buttons untuk status verifying */}
      {status === 'verifying' ? (
        <>
          <button
            type="button"
            onClick={verifyPayment}
            disabled={verifying}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-success px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {verifying ? <Loader2 size={14} className="animate-spin" strokeWidth={2.5} /> : <CheckCircle2 size={14} strokeWidth={2.5} />}
            {totalIdr ? `Konfirmasi Rp ${totalIdr.toLocaleString('id-ID')}` : 'Konfirmasi Pembayaran'}
          </button>
          <button
            type="button"
            onClick={rejectPayment}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-danger px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all"
          >
            <XCircle size={14} strokeWidth={2.5} />
            Reject
          </button>
        </>
      ) : null}

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
      {!['refunded', 'expired', 'cancelled', 'pending_payment', 'verifying'].includes(status) ? (
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
