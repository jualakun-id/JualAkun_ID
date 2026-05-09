'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export function RetryButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    await api.post(`/admin/notifications/${id}/retry`)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary-light hover:bg-primary/20 disabled:opacity-50"
    >
      {loading ? '...' : 'Retry'}
    </button>
  )
}
