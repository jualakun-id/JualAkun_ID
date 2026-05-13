'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, KeyRound, Info, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  credentials_text: string
  note: string | null
  guarantee_expires_at: string
}

export function OrderActions({ order }: Props) {
  const router = useRouter()
  const [creds, setCreds] = useState<Credentials | null>(null)
  const [loadingCreds, setLoadingCreds] = useState(false)
  const [credsError, setCredsError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const showCreds = ['delivered', 'confirmed'].includes(order.status)

  async function handleCopy() {
    if (!creds) return
    await navigator.clipboard.writeText(creds.credentials_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /**
   * Load credentials + AUTO-CONFIRM kalau status masih 'delivered'.
   * Konsep: aksi "buka credentials" = signal buyer menerima → auto-update
   * status ke 'confirmed' → unlock review section. Tidak perlu tombol
   * "Konfirmasi Akun Aktif" terpisah (UX simpler). Kalau buyer ada masalah,
   * tetap bisa klaim garansi via tiket.
   */
  async function loadCredentials() {
    setLoadingCreds(true)
    setCredsError(null)
    const result = await api.get<Credentials>(`/orders/${order.id}/credentials`)
    if (!result.ok) {
      setLoadingCreds(false)
      setCredsError(result.message ?? 'Gagal memuat credentials')
      return
    }
    setCreds(result.data)

    // Auto-confirm: kalau status masih delivered, mark confirmed di background.
    // Fire-and-forget — buyer tetap bisa baca credentials walaupun confirm
    // gagal. router.refresh() di akhir supaya UI update timeline + review.
    if (order.status === 'delivered') {
      try {
        await api.post(`/orders/${order.id}/confirm`)
        router.refresh()
      } catch (err) {
        console.warn('[order] auto-confirm failed (non-blocking):', err)
      }
    }
    setLoadingCreds(false)
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
            Klik tombol di bawah untuk menampilkan info akses akun (sama dengan yang dikirim via WA & email).
            {order.status === 'delivered' ? (
              <span className="block mt-1 text-[13px] text-ink-subtle">
                Membuka credentials = konfirmasi Anda terima akun, lalu Anda bisa kasih review.
              </span>
            ) : null}
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
          {/* 1 textbox utuh — apapun format dari admin/supplier (email,
              password, verify email, expiry, catatan) ditampilkan apa
              adanya. Tidak ada parsing yang bisa salah */}
          <div className="rounded-xl border-2 border-black/15 bg-brand-50/40 overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-black/10 bg-white/60 px-4 py-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                Info Akses Akun
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 hover:text-brand-900"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Disalin' : 'Salin Semua'}
              </button>
            </div>
            <pre className="px-4 py-3 text-[14px] font-mono text-ink leading-relaxed whitespace-pre-wrap break-words select-all">
              {creds.credentials_text}
            </pre>
          </div>
          {creds.note ? (
            <div className="flex items-start gap-2.5 rounded-xl border-2 border-info/40 bg-info/10 p-4">
              <Info size={18} className="text-info shrink-0 mt-0.5" strokeWidth={2.25} />
              <div className="text-sm text-info">
                <strong className="block text-xs uppercase tracking-wider font-bold mb-1">Catatan dari admin</strong>
                <span className="font-medium leading-relaxed">{creds.note}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
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
