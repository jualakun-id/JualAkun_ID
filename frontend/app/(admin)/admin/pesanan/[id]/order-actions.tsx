'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/admin/confirm-button'
import { api } from '@/lib/api'

type Props = { orderId: string; status: string }

export function OrderActions({ orderId, status }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function manualDeliver() {
    const result = await api.post(`/admin/orders/${orderId}/deliver`)
    if (!result.ok) {
      setError(result.message ?? 'Gagal manual deliver')
      return
    }
    router.refresh()
  }

  async function refund() {
    const result = await api.patch(`/admin/orders/${orderId}/status`, { status: 'refunded' })
    if (!result.ok) {
      setError(result.message ?? 'Gagal refund')
      return
    }
    router.refresh()
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {['paid', 'delivery_failed'].includes(status) ? (
        <Button onClick={manualDeliver}>Kirim Manual</Button>
      ) : null}
      {!['refunded', 'expired'].includes(status) ? (
        <ConfirmButton
          label="Proses Refund"
          confirmMessage="Yakin proses refund? Status akan berubah ke refunded."
          variant="danger"
          onConfirm={refund}
        />
      ) : null}
      {error ? <div className="w-full rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div> : null}
    </div>
  )
}
