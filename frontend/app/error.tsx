'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'
import { Logo } from '@/components/branding/logo'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('App error:', error.message, error.digest)
    }
  }, [error])

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-4 py-12"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1.5px 1.5px, rgba(18,150,168,0.15) 1.5px, transparent 0)',
        backgroundSize: '18px 18px',
      }}
    >
      <Link href="/" className="mb-10 transition-transform hover:-translate-y-0.5">
        <Logo size="md" showTagline />
      </Link>

      <div className="w-full max-w-lg rounded-2xl border-2 border-black bg-white p-7 sm:p-9 shadow-[0_6px_0_rgba(0,0,0,0.9)] text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/15 text-danger border-2 border-danger/40">
          <AlertTriangle size={30} strokeWidth={2.25} />
        </div>

        <h1 className="mt-5 font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Aduh, ada yang error
        </h1>

        <p className="mt-3 text-[15px] sm:text-base text-ink-muted leading-relaxed font-medium">
          Sepertinya ada hal yang nggak berjalan semestinya di sisi kami. Tim teknis sudah kami notifikasi otomatis. Coba refresh dulu, atau balik ke beranda.
        </p>

        {error.digest ? (
          <p className="mt-4 text-xs font-mono text-ink-subtle bg-gray-50 border border-gray-200 rounded-md px-3 py-2 inline-block">
            ID Error: {error.digest}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-ink font-extrabold px-6 py-3 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
          >
            <RefreshCw size={16} strokeWidth={2.5} />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-ink font-extrabold px-6 py-3 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
          >
            <Home size={16} strokeWidth={2.5} />
            Ke Beranda
          </Link>
        </div>
      </div>

      <Link
        href="/kontak"
        className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand-700 transition-colors"
      >
        <MessageCircle size={14} />
        Masih error? Lapor ke tim support
      </Link>
    </main>
  )
}
