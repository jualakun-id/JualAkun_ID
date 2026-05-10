'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, AlertCircle, MessageSquareQuote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

type ExistingReview = {
  rating: number
  comment: string | null
  created_at: string
}

type Props = {
  orderId: string
  existingReview: ExistingReview | null
}

export function ReviewSection({ orderId, existingReview }: Props) {
  const router = useRouter()
  const [hover, setHover] = useState(0)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Optimistic state pasca submit (sebelum router.refresh selesai)
  const [submitted, setSubmitted] = useState<ExistingReview | null>(null)

  const review = submitted ?? existingReview

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) {
      setError('Pilih rating bintang dulu (1-5)')
      return
    }
    setError(null)
    setLoading(true)
    const result = await api.post('/reviews', {
      order_id: orderId,
      rating,
      comment: comment.trim() || undefined,
    })
    setLoading(false)
    if (!result.ok) {
      setError(
        result.code === 'REVIEW_ALREADY_EXISTS'
          ? 'Kamu sudah kasih review untuk pesanan ini.'
          : (result.message ?? 'Gagal mengirim review'),
      )
      return
    }
    setSubmitted({
      rating,
      comment: comment.trim() || null,
      created_at: new Date().toISOString(),
    })
    router.refresh()
  }

  if (review) {
    return (
      <div className="mt-6 rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_4px_0_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-2.5">
          <MessageSquareQuote size={22} className="text-brand-600" strokeWidth={2.25} />
          <h2 className="font-heading text-xl md:text-2xl font-extrabold text-ink tracking-tight">
            Ulasan Kamu
          </h2>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex gap-0.5 text-warning">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={20}
                fill="currentColor"
                className={i < review.rating ? 'text-warning' : 'text-gray-200'}
              />
            ))}
          </div>
          <span className="text-sm text-ink-muted font-medium ml-2">
            {formatDate(review.created_at)}
          </span>
        </div>
        {review.comment ? (
          <p className="mt-3 text-[15px] text-ink leading-relaxed font-medium whitespace-pre-line">
            {review.comment}
          </p>
        ) : (
          <p className="mt-3 text-sm text-ink-subtle italic font-medium">
            Tidak ada komentar tertulis
          </p>
        )}
        <p className="mt-4 text-xs text-ink-subtle font-medium">
          Terima kasih sudah berbagi feedback. Review kamu membantu pembeli lain.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_4px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2.5">
        <MessageSquareQuote size={22} className="text-brand-600" strokeWidth={2.25} />
        <h2 className="font-heading text-xl md:text-2xl font-extrabold text-ink tracking-tight">
          Beri Ulasan
        </h2>
      </div>
      <p className="mt-2 text-[15px] text-ink-muted font-medium leading-relaxed">
        Sudah pakai produknya? Kasih rating + komentar singkat — bantu pembeli lain memutuskan.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div>
          <label className="text-sm font-bold text-ink block">Rating</label>
          <div
            className="mt-2 flex gap-1"
            onMouseLeave={() => setHover(0)}
            role="radiogroup"
            aria-label="Rating bintang"
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = (hover || rating) >= n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  className="rounded p-1 transition-transform hover:scale-110"
                  aria-label={`${n} bintang`}
                  aria-pressed={rating === n}
                >
                  <Star
                    size={32}
                    fill={filled ? 'currentColor' : 'none'}
                    className={filled ? 'text-warning' : 'text-gray-300'}
                    strokeWidth={2}
                  />
                </button>
              )
            })}
            {rating > 0 ? (
              <span className="ml-3 self-center text-sm text-ink-muted font-bold">
                {rating}/5
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-ink">
            Komentar <span className="text-ink-subtle font-medium">(opsional)</span>
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            placeholder="Cerita singkat — apa yang kamu suka, apa yang bisa ditingkatkan..."
            className="mt-2 w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
          <p className="mt-1.5 text-xs text-ink-subtle font-medium">
            {comment.length}/1000 karakter
          </p>
        </div>

        {error ? (
          <div className="flex items-start gap-2.5 rounded-lg border-2 border-danger/40 bg-danger/10 px-3.5 py-3 text-sm font-medium text-danger">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <Button type="submit" disabled={loading || rating < 1} size="lg" className="w-full">
          {loading ? 'Mengirim...' : 'Kirim Ulasan'}
        </Button>
      </form>
    </div>
  )
}
