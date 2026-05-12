'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCog, Ban, RotateCcw, Loader2 } from 'lucide-react'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = {
  userId: string
  currentStatus: 'active' | 'suspended' | 'banned'
}

export function UserStatusActions({ userId, currentStatus }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  async function setStatus(status: 'active' | 'suspended' | 'banned') {
    const labels = { active: 'aktifkan', suspended: 'suspend', banned: 'ban' }
    if (!confirm(`Yakin ${labels[status]} user ini?`)) return
    setLoading(status)
    const result = await api.patch(`/admin/users/${userId}/status`, { status })
    setLoading(null)
    if (!result.ok) {
      toast.error(result.message ?? `Gagal ${labels[status]}`)
      return
    }
    toast.success(`User di-${labels[status]} ✓`)
    router.refresh()
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {currentStatus === 'active' ? (
        <>
          <button
            type="button"
            onClick={() => setStatus('suspended')}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-warning px-4 py-2 text-sm font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading === 'suspended' ? <Loader2 size={14} className="animate-spin" strokeWidth={2.5} /> : <UserCog size={14} strokeWidth={2.5} />}
            Suspend
          </button>
          <button
            type="button"
            onClick={() => setStatus('banned')}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-danger px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Ban size={14} strokeWidth={2.5} />
            Ban Permanen
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setStatus('active')}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-success px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading === 'active' ? <Loader2 size={14} className="animate-spin" strokeWidth={2.5} /> : <RotateCcw size={14} strokeWidth={2.5} />}
          Aktifkan Kembali
        </button>
      )}
    </div>
  )
}
