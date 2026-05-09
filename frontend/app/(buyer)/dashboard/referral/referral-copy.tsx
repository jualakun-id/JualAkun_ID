'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function ReferralCopy({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mt-4">
      <div className="text-xs uppercase tracking-wide text-text-subtle">Link referral</div>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-surface-2 p-2">
        <code className="flex-1 truncate text-sm text-text">{link}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={1.5} className="mr-1 inline" />
              Tersalin
            </>
          ) : (
            <>
              <Copy size={14} strokeWidth={1.5} className="mr-1 inline" />
              Salin
            </>
          )}
        </button>
      </div>
    </div>
  )
}
