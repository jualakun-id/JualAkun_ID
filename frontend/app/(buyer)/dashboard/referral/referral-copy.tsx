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
      <div className="text-xs uppercase tracking-wide text-ink-subtle">Link referral</div>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2">
        <code className="flex-1 truncate text-sm text-ink">{link}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
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
