'use client'

import { useState } from 'react'
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
      <div className="rounded-md border border-success/30 bg-success/10 px-4 py-4 text-sm text-success">
        Jika email terdaftar, kami sudah kirim link reset. Cek inbox Anda.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-ink-muted">Email</label>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Memproses...' : 'Kirim Link Reset'}
      </Button>
    </form>
  )
}
