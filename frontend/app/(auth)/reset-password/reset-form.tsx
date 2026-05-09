'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase'

export function ResetForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter')
      return
    }
    setLoading(true)
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/masuk')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-ink-muted">Password baru</label>
        <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <label className="text-sm font-medium text-ink-muted">Konfirmasi password</label>
        <Input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5" />
      </div>
      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
      ) : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Memproses...' : 'Simpan Password'}
      </Button>
    </form>
  )
}
