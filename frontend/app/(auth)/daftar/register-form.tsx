'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

type Props = { referralCode: string | null }

export function RegisterForm({ referralCode }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_wa: '',
    referral_code: referralCode ?? '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await api.post<{ user_id: string; email: string; message: string }>(
      '/auth/register',
      {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone_wa: form.phone_wa || undefined,
        referral_code: form.referral_code || undefined,
      },
      { auth: false },
    )
    setLoading(false)
    if (!result.ok) {
      setError(result.message ?? 'Gagal mendaftar')
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/masuk'), 2500)
  }

  if (success) {
    return (
      <div className="rounded-md border border-success/30 bg-success/10 px-4 py-4 text-sm text-success">
        Berhasil daftar. Cek email Anda untuk verifikasi, lalu login.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-text-muted">Nama lengkap</label>
        <Input required value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <label className="text-sm font-medium text-text-muted">Email</label>
        <Input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <label className="text-sm font-medium text-text-muted">No. WhatsApp <span className="text-text-subtle">(opsional)</span></label>
        <Input placeholder="0812xxxxxxxx" value={form.phone_wa} onChange={(e) => update('phone_wa', e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <label className="text-sm font-medium text-text-muted">Password</label>
        <Input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-text-subtle">Minimal 8 karakter</p>
      </div>
      {form.referral_code ? (
        <div>
          <label className="text-sm font-medium text-text-muted">Kode referral</label>
          <Input value={form.referral_code} onChange={(e) => update('referral_code', e.target.value.toUpperCase())} className="mt-1.5 font-mono" />
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
      ) : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Memproses...' : 'Daftar'}
      </Button>
    </form>
  )
}
