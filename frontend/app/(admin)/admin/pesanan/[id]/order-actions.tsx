'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/admin/confirm-button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = { orderId: string; status: string }

export function OrderActions({ orderId, status }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [delivering, setDelivering] = useState(false)

  async function manualDeliver() {
    setDelivering(true)
    const result = await api.post(`/admin/orders/${orderId}/deliver`)
    setDelivering(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal manual deliver')
      return
    }
    toast.success('Akun berhasil dikirim ke buyer ✓')
    router.refresh()
  }

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
      {['paid', 'delivery_failed'].includes(status) ? (
        <Button onClick={manualDeliver} loading={delivering}>
          Kirim Manual
        </Button>
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
