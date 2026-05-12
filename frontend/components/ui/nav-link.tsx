'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition, type ReactNode, type MouseEvent } from 'react'
import { Loader2 } from 'lucide-react'

type Props = {
  href: string
  children: ReactNode
  className?: string
  /** Render Loader2 spinner saat pending. Default true. */
  showSpinner?: boolean
  /** Posisi spinner kalau ditampilkan: 'leading' (kiri children) atau 'replace' (gantikan children). */
  spinnerPosition?: 'leading' | 'replace'
  /** Custom label saat loading (kalau spinnerPosition='replace'). Default: children. */
  loadingLabel?: ReactNode
  /** Custom onClick handler — dipanggil sebelum navigation. */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  /** Pass-through props link */
  target?: string
  rel?: string
  prefetch?: boolean
  'aria-label'?: string
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'
  title?: string
}

/**
 * NavLink — Link yang tampilkan loading state saat navigasi (useTransition).
 * Spinner muncul antara klik dan halaman tujuan render. Mencegah double-click
 * + UX clarity bahwa proses sedang jalan.
 *
 * Pakai untuk tombol navigation yang trigger transition cukup signifikan
 * (auth flow, dashboard, checkout, etc). Untuk link statis cepat, pakai Link biasa.
 */
export function NavLink({
  href,
  children,
  className,
  showSpinner = true,
  spinnerPosition = 'leading',
  loadingLabel,
  onClick,
  ...rest
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Honor modifier keys (cmd/ctrl click = open new tab) — don't intercept
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    // Honor target=_blank
    if (rest.target === '_blank') return
    e.preventDefault()
    onClick?.(e)
    startTransition(() => router.push(href))
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-busy={isPending}
      data-pending={isPending ? 'true' : undefined}
      className={className}
      {...rest}
    >
      {isPending && showSpinner && spinnerPosition === 'replace' ? (
        <>
          <Loader2 size={16} strokeWidth={2.5} className="animate-spin shrink-0" />
          {loadingLabel ?? children}
        </>
      ) : (
        <>
          {isPending && showSpinner && spinnerPosition === 'leading' ? (
            <Loader2 size={16} strokeWidth={2.5} className="animate-spin shrink-0" />
          ) : null}
          {children}
        </>
      )}
    </Link>
  )
}
