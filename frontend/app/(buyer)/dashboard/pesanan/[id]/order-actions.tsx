'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertTriangle, KeyRound, Info } from 'lucide-react'
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
    <div className="mt-6 rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_4px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2.5">
        <KeyRound size={22} className="text-brand-600" strokeWidth={2.25} />
        <h2 className="font-heading text-xl md:text-2xl font-extrabold text-ink tracking-tight">
          Akses Akun
        </h2>
      </div>

      {!creds ? (
        <div className="mt-5">
          <p className="text-[15px] text-ink-muted font-medium leading-relaxed">
            Klik tombol di bawah untuk menampilkan credentials. Login dengan username & password ini di service yang kamu beli.
          </p>
          <Button onClick={loadCredentials} disabled={loadingCreds} size="lg" className="mt-4">
            {loadingCreds ? 'Memuat...' : 'Tampilkan Credentials'}
          </Button>
          {credsError ? (
            <p className="mt-3 flex items-start gap-2 text-sm font-medium text-danger">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{credsError}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <CredentialBox label="Username / Email" value={creds.credentials.username} />
          {creds.credentials.password ? (
            <CredentialBox label="Password" value={creds.credentials.password} maskable />
          ) : null}
          {creds.credentials.note ? (
            <div className="flex items-start gap-2.5 rounded-xl border-2 border-info/40 bg-info/10 p-4">
              <Info size={18} className="text-info shrink-0 mt-0.5" strokeWidth={2.25} />
              <div className="text-sm text-info">
                <strong className="block text-xs uppercase tracking-wider font-bold mb-1">Catatan dari admin</strong>
                <span className="font-medium leading-relaxed">{creds.credentials.note}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {order.status === 'delivered' ? (
          <Button onClick={handleConfirm} disabled={confirming} variant="primary">
            <CheckCircle2 size={16} strokeWidth={2.5} />
            {confirming ? 'Memproses...' : 'Konfirmasi Akun Aktif'}
          </Button>
        ) : null}
        <a
          href={`/dashboard/tiket/baru?order_id=${order.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-warning/15 hover:bg-warning/20 text-warning font-extrabold px-5 py-2.5 text-sm border-2 border-warning/50 transition-colors"
        >
          <AlertTriangle size={16} strokeWidth={2.5} />
          Klaim Garansi
        </a>
      </div>
    </div>
  )
}
