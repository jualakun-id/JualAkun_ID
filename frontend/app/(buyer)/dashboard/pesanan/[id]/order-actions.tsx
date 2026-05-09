'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CredentialBox } from '@/components/credential-box'
import { api } from '@/lib/api'
import type { OrderStatus } from '@/types'

type Props = {
  order: {
    id: string
    status: OrderStatus
    guarantee_expires_at: string | null
  }
  jwt: string | null
}

type Credentials = {
  credentials: { username: string; password: string; note: string | null }
  guarantee_expires_at: string
}

export function OrderActions({ order }: Props) {
  const router = useRouter()
  const [creds, setCreds] = useState<Credentials | null>(null)
  const [loadingCreds, setLoadingCreds] = useState(false)
  const [credsError, setCredsError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const showCreds = ['delivered', 'confirmed'].includes(order.status)

  async function loadCredentials() {
    setLoadingCreds(true)
    setCredsError(null)
    const result = await api.get<Credentials>(`/orders/${order.id}/credentials`)
    setLoadingCreds(false)
    if (!result.ok) {
      setCredsError(result.message ?? 'Gagal memuat credentials')
      return
    }
    setCreds(result.data)
  }

  async function handleConfirm() {
    setConfirming(true)
    const result = await api.post<{ ok: boolean; status: 'confirmed' }>(`/orders/${order.id}/confirm`)
    setConfirming(false)
    if (!result.ok) return
    router.refresh()
  }

  if (!showCreds) return null

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="font-heading text-h3">Akses Akun</h2>
      {!creds ? (
        <div className="mt-4">
          <Button onClick={loadCredentials} disabled={loadingCreds}>
            {loadingCreds ? 'Memuat...' : 'Tampilkan Credentials'}
          </Button>
          {credsError ? (
            <p className="mt-2 text-sm text-danger">{credsError}</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <CredentialBox label="Username / Email" value={creds.credentials.username} />
          {creds.credentials.password ? (
            <CredentialBox label="Password" value={creds.credentials.password} />
          ) : null}
          {creds.credentials.note ? (
            <div className="rounded-md border border-info/30 bg-info/10 px-3 py-2 text-sm text-info">
              <strong className="block text-xs uppercase tracking-wide">Catatan</strong>
              {creds.credentials.note}
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {order.status === 'delivered' ? (
          <Button onClick={handleConfirm} disabled={confirming} variant="primary">
            <CheckCircle2 size={16} strokeWidth={1.5} />
            {confirming ? 'Memproses...' : 'Konfirmasi Akun Aktif'}
          </Button>
        ) : null}
        <a
          href={`/dashboard/tiket/baru?order_id=${order.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-semibold text-warning hover:bg-warning/15"
        >
          <AlertTriangle size={16} strokeWidth={1.5} />
          Klaim Garansi
        </a>
      </div>
    </div>
  )
}
