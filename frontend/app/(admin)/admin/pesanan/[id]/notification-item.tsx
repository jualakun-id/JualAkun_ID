'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'
import { StatusBadge } from '@/components/admin/status-badge'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'

type Notif = {
  id: string
  channel: string
  template: string
  status: string
  created_at: string
}

type Props = { orderId: string; notif: Notif }

export function NotificationItem({ orderId, notif }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function handleResend() {
    if (!confirm(`Resend notif ${notif.channel.toUpperCase()} (${notif.template})?`)) return
    setLoading(true)
    const result = await api.post(`/admin/orders/${orderId}/notifications/${notif.id}/resend`)
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal resend notif')
      return
    }
    toast.success('Notif berhasil dikirim ulang ✓')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-black/10 bg-brand-50/40 px-3 py-2 text-xs">
      <div className="flex-1">
        <div className="font-mono uppercase text-ink-muted">{notif.channel} · {notif.template}</div>
        <div className="text-ink-subtle">{formatDateTime(notif.created_at)}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <StatusBadge variant="notification" status={notif.status} />
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          title="Kirim ulang notifikasi ini"
          className="inline-flex items-center gap-0.5 rounded-md border border-black/15 bg-white px-1.5 py-1 text-[10px] font-extrabold text-ink-muted hover:border-brand-400 hover:text-brand-700 disabled:opacity-50"
        >
          {loading ? <Loader2 size={10} className="animate-spin" strokeWidth={2.5} /> : <RefreshCw size={10} strokeWidth={2.5} />}
          Resend
        </button>
      </div>
    </div>
  )
}
