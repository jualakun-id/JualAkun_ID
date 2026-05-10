'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase'

export function ForgotForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createBrowserClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border-2 border-success/40 bg-success/10 px-4 py-4 text-sm font-medium text-success">
        <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Cek email kamu</p>
          <p className="mt-1">Kalau email terdaftar, kami sudah kirim link reset password. Cek inbox & folder spam.</p>
        </div>
      </div>
    )
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
      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? 'Memproses...' : 'Kirim Link Reset'}
      </Button>
    </form>
  )
}
