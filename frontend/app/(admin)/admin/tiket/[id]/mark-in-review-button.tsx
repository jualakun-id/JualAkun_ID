'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Loader2 } from 'lucide-react'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = { ticketId: string }

/**
 * Quick action: mark tiket sebagai 'in_review' (dari status 'open').
 * Admin tap untuk signal "lagi ditangani" sebelum decision resolve/reject.
 */
export function MarkInReviewButton({ ticketId }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const result = await api.patch(`/admin/tickets/${ticketId}/status`, { status: 'in_review' })
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal mark in review')
      return
    }
    toast.success('Tiket di-mark IN REVIEW ✓')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title="Tandai tiket sedang ditangani"
      className="inline-flex items-center gap-1.5 rounded-md border-2 border-black bg-warning px-3 py-1 text-xs font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 disabled:opacity-50"
    >
      {loading ? <Loader2 size={11} className="animate-spin" strokeWidth={2.5} /> : <Eye size={11} strokeWidth={2.5} />}
      Mark In Review
    </button>
  )
}
