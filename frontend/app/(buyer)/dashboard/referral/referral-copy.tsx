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
    <div className="mt-5">
      <div className="text-xs uppercase tracking-wider text-ink-muted font-bold">Link referral</div>
      <div className="mt-2 flex items-center gap-2 rounded-lg border-2 border-black/15 bg-brand-50/50 p-2">
        <code className="flex-1 truncate text-sm text-ink font-medium px-2">{link}</code>
        <button
          type="button"
          onClick={handleCopy}
          className={`rounded-lg px-4 py-2 text-sm font-extrabold border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 inline-flex items-center gap-1.5 whitespace-nowrap ${
            copied
              ? 'bg-success text-white'
              : 'bg-brand-500 text-ink hover:bg-brand-400'
          }`}
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={3} />
              Tersalin
            </>
          ) : (
            <>
              <Copy size={14} strokeWidth={2.5} />
              Salin
            </>
          )}
        </button>
      </div>
    </div>
  )
}
