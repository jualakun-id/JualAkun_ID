'use client'

import { useState } from 'react'
import { Copy, Check, Eye, EyeOff } from 'lucide-react'

type Props = {
  label: string
  value: string
  /** mask the value (for passwords) — toggle button revealed */
  maskable?: boolean
}

export function CredentialBox({ label, value, maskable = false }: Props) {
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(!maskable)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const displayValue = maskable && !revealed ? '•'.repeat(Math.min(value.length, 16)) : value

  return (
    <div className="rounded-xl border-2 border-black/15 bg-brand-50/40 p-4">
      <div className="text-xs uppercase tracking-wider font-bold text-ink-muted">{label}</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <code className="flex-1 font-mono text-sm sm:text-base text-ink font-medium break-all">
          {displayValue}
        </code>
        <div className="flex items-center gap-1.5 shrink-0">
          {maskable ? (
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className="inline-flex items-center justify-center rounded-md p-2 text-ink-muted hover:bg-white hover:text-ink transition-colors"
              aria-label={revealed ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
            >
              {revealed ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center justify-center rounded-md p-2 transition-colors ${
              copied ? 'bg-success text-white' : 'text-ink-muted hover:bg-white hover:text-ink'
            }`}
            aria-label={`Salin ${label}`}
          >
            {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </div>
  )
}
