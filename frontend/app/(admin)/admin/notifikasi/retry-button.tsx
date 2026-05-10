'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCw } from 'lucide-react'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

export function RetryButton({ id }: { id: string }) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const result = await api.post(`/admin/notifications/${id}/retry`)
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal retry notifikasi')
      return
    }
    toast.success('Retry dijadwalkan ✓')
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-md border-2 border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100 disabled:opacity-50 transition-colors"
    >
      <RotateCw size={11} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
      {loading ? '...' : 'Retry'}
    </button>
  )
}
