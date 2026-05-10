'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Validasi next: harus same-origin path (mulai dengan tunggal "/" + bukan "//"
  // atau "/\") supaya tidak bisa di-exploit untuk open redirect ke external URL
  const rawNext = searchParams.get('next')
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\')
      ? rawNext
      : '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(
        error.message.toLowerCase().includes('confirm')
          ? 'Email belum diverifikasi. Cek inbox kamu.'
          : 'Email atau password salah.',
      )
      return
    }
    router.push(next as `/${string}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-bold text-ink">Email</label>
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="kamu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <label className="text-sm font-bold text-ink">Password</label>
        <Input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Min. 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2"
        />
      </div>
      {error ? (
        <div className="flex items-start gap-2.5 rounded-lg border-2 border-danger/40 bg-danger/10 px-3.5 py-3 text-sm font-medium text-danger">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}
      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  )
}
