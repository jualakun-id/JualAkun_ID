import Link from 'next/link'

type LogoSize = 'sm' | 'md' | 'lg'

const SIZES: Record<
  LogoSize,
  { mark: number; wordmark: string; tagline: string; gap: string; taglineMt: string }
> = {
  // Sized so wordmark width ≈ tagline width below it (visual alignment)
  sm: { mark: 32, wordmark: 'text-lg',    tagline: 'text-[10px]', gap: 'gap-2',   taglineMt: 'mt-0.5' },
  md: { mark: 44, wordmark: 'text-2xl',   tagline: 'text-xs',     gap: 'gap-2',   taglineMt: 'mt-0.5' },
  lg: { mark: 56, wordmark: 'text-3xl',   tagline: 'text-sm',     gap: 'gap-2.5', taglineMt: 'mt-1' },
}

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
 * Logo Jualakun.id — diamond+checkmark mark + wordmark + tagline.
 *
 * Symbology:
 *  - Diamond  → "Akun Langka" (rare, premium)
 *  - Checkmark → "Tetap Asli" (authentic, verified)
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
  const accentColor   = inverted ? 'text-brand-400' : 'text-brand-500'
  const markColor     = inverted ? 'text-brand-400' : 'text-brand-500'
  const taglineColor  = inverted ? 'text-brand-400/90' : 'text-brand-600'

  const inner = (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark size={s.mark} className={markColor} />
      <div className="flex flex-col leading-none">
        <div className={`font-extrabold ${s.wordmark} ${wordmarkColor} tracking-tight`}>
          Jualakun<span className={accentColor}>.id</span>
        </div>
        {showTagline && (
          <div
            className={`${s.tagline} ${taglineColor} font-semibold italic ${s.taglineMt} tracking-tight whitespace-nowrap`}
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
 * SVG mark — pakai standalone untuk favicon, social share, dll.
 * Diamond shape (langka) + checkmark inside (asli).
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
      {/* Outer diamond — fill current color */}
      <path
        d="M20 3 L37 20 L20 37 L3 20 Z"
        fill="currentColor"
      />
      {/* Inner subtle highlight on top-left edge for depth */}
      <path
        d="M20 3 L37 20 L20 20 Z"
        fill="white"
        fillOpacity="0.15"
      />
      {/* Authenticity checkmark */}
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
