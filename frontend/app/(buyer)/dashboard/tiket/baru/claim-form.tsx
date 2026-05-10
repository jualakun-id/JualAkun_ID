'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { REASON_OPTIONS } from '../ticket-helpers'

type CreateResponse = {
  ticket_id: string
  status: string
  message: string
}

export function ClaimForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [reason, setReason] = useState<string>('cant_login')
  const [description, setDescription] = useState('')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<CreateResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await api.post<CreateResponse>('/tickets', {
      order_id: orderId,
      reason,
      description: description.trim() || undefined,
      screenshot_url: screenshotUrl.trim() || undefined,
    })
    setLoading(false)
    if (!result.ok) {
      setError(result.message ?? 'Gagal membuat klaim')
      return
    }
    setSuccess(result.data)
    setTimeout(() => router.push(`/dashboard/tiket/${result.data.ticket_id}`), 1800)
  }

  if (success) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border-2 border-success/40 bg-success/10 px-4 py-4 text-sm font-medium text-success">
        <CheckCircle2 size={20} className="shrink-0 mt-0.5" strokeWidth={2.25} />
        <div>
          <p className="font-extrabold">Klaim berhasil dibuat 🎉</p>
          <p className="mt-1 leading-relaxed">{success.message}</p>
          <p className="mt-2 text-xs">Mengarahkan ke detail tiket...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-bold text-ink">Alasan klaim</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="mt-2 w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        >
          {REASON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-bold text-ink">
          Kronologi <span className="text-ink-subtle font-medium">(opsional, tapi disarankan)</span>
        </label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          placeholder="Ceritakan singkat — sejak kapan akun bermasalah, gejala apa yang muncul, langkah yang sudah dicoba, dll."
          className="mt-2 w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        />
        <p className="mt-1.5 text-xs text-ink-subtle font-medium">
          {description.length}/2000 karakter
        </p>
      </div>

      <div>
        <label className="text-sm font-bold text-ink">
          Link screenshot bukti{' '}
          <span className="text-ink-subtle font-medium">(opsional)</span>
        </label>
        <Input
          type="url"
          value={screenshotUrl}
          onChange={(e) => setScreenshotUrl(e.target.value)}
          placeholder="https://imgur.com/..."
          className="mt-2"
        />
        <p className="mt-1.5 text-xs text-ink-subtle font-medium">
          Upload ke{' '}
          <a
            href="https://imgur.com/upload"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 hover:text-brand-800 underline"
          >
            imgur.com
          </a>{' '}
          atau Google Drive (set permission &quot;anyone with link&quot;), paste URL di sini.
        </p>
      </div>

      {error ? (
        <div className="flex items-start gap-2.5 rounded-lg border-2 border-danger/40 bg-danger/10 px-3.5 py-3 text-sm font-medium text-danger">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? 'Mengirim klaim...' : 'Kirim Klaim Garansi'}
      </Button>

      <p className="text-center text-xs text-ink-subtle font-medium leading-relaxed">
        Dengan kirim klaim, kamu setuju kami review akun yang dimaksud. Klaim palsu / tidak valid
        bisa berakibat suspend akun.
      </p>
    </form>
  )
}
