'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
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
      setError('Konfirmasi password tidak cocok.')
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-bold text-ink">Password baru</label>
        <Input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Min. 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <label className="text-sm font-bold text-ink">Konfirmasi password</label>
        <Input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Ulang password baru"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
        {loading ? 'Memproses...' : 'Simpan Password'}
      </Button>
    </form>
  )
}
