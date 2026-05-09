'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

type Props = {
  label: string
  value: string
}

export function CredentialBox({ label, value }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="text-xs uppercase tracking-wide text-text-subtle">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <code className="font-mono text-sm text-text">{value}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md p-1.5 text-text-muted hover:bg-surface hover:text-text"
          aria-label={`Salin ${label}`}
        >
          {copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  )
}
