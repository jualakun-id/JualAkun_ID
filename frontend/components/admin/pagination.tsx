import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  /** Current page (1-indexed) */
  page: number
  /** Items per page */
  limit: number
  /** Total items across all pages */
  total: number
  /** Base path WITHOUT page param (e.g., "/admin/pesanan?status=paid") */
  basePath: string
  /** Query param name for page (default: "page") */
  pageParam?: string
}

/**
 * Pagination — sticker-style prev/next + page indicator.
 * Compact: hanya tampil kalau total > limit.
 * Hide kedua tombol kalau cuma 1 page.
 */
export function Pagination({ page, limit, total, basePath, pageParam = 'page' }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (totalPages <= 1) return null

  const buildHref = (p: number) => {
    const sep = basePath.includes('?') ? '&' : '?'
    return `${basePath}${sep}${pageParam}=${p}`
  }

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-medium"
    >
      <p className="text-ink-muted">
        Menampilkan{' '}
        <strong className="text-ink tabular-nums">
          {startItem}–{endItem}
        </strong>{' '}
        dari{' '}
        <strong className="text-ink tabular-nums">{total.toLocaleString('id-ID')}</strong> total
      </p>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={buildHref(page - 1)}
            className="inline-flex items-center gap-1 bg-white hover:bg-brand-50 text-ink font-extrabold px-3 py-2 rounded-lg border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-xs"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
            Sebelumnya
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 font-extrabold px-3 py-2 rounded-lg border-2 border-gray-200 text-xs cursor-not-allowed">
            <ChevronLeft size={14} strokeWidth={2.5} />
            Sebelumnya
          </span>
        )}

        <span className="px-3 py-2 text-xs font-bold text-ink bg-brand-50 rounded-lg border-2 border-brand-200 tabular-nums">
          Hal {page} / {totalPages}
        </span>

        {hasNext ? (
          <Link
            href={buildHref(page + 1)}
            className="inline-flex items-center gap-1 bg-white hover:bg-brand-50 text-ink font-extrabold px-3 py-2 rounded-lg border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-xs"
          >
            Berikutnya
            <ChevronRight size={14} strokeWidth={2.5} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 font-extrabold px-3 py-2 rounded-lg border-2 border-gray-200 text-xs cursor-not-allowed">
            Berikutnya
            <ChevronRight size={14} strokeWidth={2.5} />
          </span>
        )}
      </div>
    </nav>
  )
}
