'use client'

import { useRouter } from 'next/navigation'
import { ConfirmButton } from '@/components/admin/confirm-button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = { orderId: string; status: string }

export function OrderActions({ orderId, status }: Props) {
  const router = useRouter()
  const toast = useToast()

  async function refund() {
    const result = await api.patch(`/admin/orders/${orderId}/status`, { status: 'refunded' })
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal proses refund')
      return
    }
    toast.success('Refund berhasil diproses ✓')
    router.refresh()
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
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
