import Link from 'next/link'
import Image from 'next/image'

type LogoSize = 'sm' | 'md' | 'lg'

const SIZES: Record<
  LogoSize,
  { mark: number; wordmark: string; tagline: string; gap: string; taglineMt: string }
> = {
  // Sized so wordmark width ≈ tagline width below it (visual alignment)
  sm: { mark: 38, wordmark: 'text-lg',    tagline: 'text-[10px]', gap: 'gap-1.5', taglineMt: 'mt-0' },
  md: { mark: 56, wordmark: 'text-2xl',   tagline: 'text-xs',     gap: 'gap-1.5', taglineMt: 'mt-0' },
  lg: { mark: 72, wordmark: 'text-3xl',   tagline: 'text-sm',     gap: 'gap-2',   taglineMt: 'mt-0' },
}

const LOGO_DOODLE_URL =
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/logo-doodle-transparent.webp'

type LogoProps = {
  /** Tampilkan tagline di bawah wordmark */
  showTagline?: boolean
  /** Untuk background gelap (footer) — pakai warna terang */
  inverted?: boolean
  /** Ukuran preset */
  size?: LogoSize
  /** Bungkus dalam Link ke "/" — default true */
  asLink?: boolean
  className?: string
}

/**
 * Logo Jualakun.id — Vexx-style doodle diamond+checkmark (image) + wordmark + tagline.
 *
 * Symbology:
 *  - Diamond  → "Akun Langka" (rare, premium)
 *  - Checkmark → "Tetap Asli" (authentic, verified)
 *  - Vexx doodle marker style → match dengan brand visual identity
 *
 * Pemakaian:
 *  - Header: <Logo />                         (medium with tagline)
 *  - Footer: <Logo size="lg" showTagline inverted />
 */
export function Logo({
  showTagline = false,
  inverted = false,
  size = 'md',
  asLink = true,
  className = '',
}: LogoProps) {
  const s = SIZES[size]
  const wordmarkColor = inverted ? 'text-white' : 'text-ink'
  // Unified brand color: ".id" + tagline + button = brand-500 (matches logo image #06B6D4)
  const accentColor   = inverted ? 'text-brand-400' : 'text-brand-500'
  const taglineColor  = inverted ? 'text-brand-400' : 'text-brand-500'

  const inner = (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      <div className="relative shrink-0 overflow-visible" style={{ width: s.mark, height: s.mark }}>
        <Image
          src={LOGO_DOODLE_URL}
          alt="Jualakun.id logo"
          fill
          sizes={`${s.mark}px`}
          className="object-contain scale-125"
          priority
        />
      </div>
      <div className="flex flex-col leading-none">
        <div className={`font-extrabold ${s.wordmark} ${wordmarkColor} tracking-tight`}>
          Jualakun<span className={`${accentColor} font-extrabold`}>.id</span>
        </div>
        {showTagline && (
          <div
            className={`${s.tagline} ${taglineColor} font-extrabold italic ${s.taglineMt} tracking-tight whitespace-nowrap`}
          >
            Anti Mainstream, Tetap Asli.
          </div>
        )}
      </div>
    </div>
  )

  if (!asLink) return inner
  return (
    <Link href="/" aria-label="Jualakun.id — kembali ke beranda" className="shrink-0 inline-block">
      {inner}
    </Link>
  )
}

/**
 * SVG mark — pakai standalone untuk favicon, social share, fallback.
 * Diamond shape (langka) + checkmark inside (asli).
 * Tetap di-export untuk kompatibilitas (favicon icon.svg, apple-icon.tsx).
 */
export function LogoMark({
  size = 36,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 3 L37 20 L20 37 L3 20 Z" fill="currentColor" />
      <path d="M20 3 L37 20 L20 20 Z" fill="white" fillOpacity="0.15" />
      <path
        d="M12 20.5 L17.5 26 L28 14"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
