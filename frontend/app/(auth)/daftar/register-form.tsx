'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
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
      <div className="flex items-start gap-2.5 rounded-lg border-2 border-success/40 bg-success/10 px-4 py-4 text-sm font-medium text-success">
        <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Akun berhasil dibuat 🎉</p>
          <p className="mt-1">Cek email kamu untuk link verifikasi, lalu login. Kami arahkan ke halaman masuk dalam 2 detik...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-bold text-ink">Nama lengkap</label>
        <Input
          required
          autoComplete="name"
          placeholder="Nama panggilanmu"
          value={form.full_name}
          onChange={(e) => update('full_name', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <label className="text-sm font-bold text-ink">Email</label>
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="kamu@email.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <label className="text-sm font-bold text-ink">
          No. WhatsApp <span className="text-ink-subtle font-medium">(opsional)</span>
        </label>
        <Input
          placeholder="0812xxxxxxxx"
          autoComplete="tel"
          value={form.phone_wa}
          onChange={(e) => update('phone_wa', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <label className="text-sm font-bold text-ink">Password</label>
        <Input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Min. 8 karakter"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="mt-2"
        />
        <p className="mt-1.5 text-xs text-ink-subtle font-medium">Min. 8 karakter — gunakan kombinasi huruf & angka</p>
      </div>
      {form.referral_code ? (
        <div>
          <label className="text-sm font-bold text-ink">Kode referral</label>
          <Input
            value={form.referral_code}
            onChange={(e) => update('referral_code', e.target.value.toUpperCase())}
            className="mt-2 font-mono uppercase"
          />
        </div>
      ) : null}
      {error ? (
        <div className="flex items-start gap-2.5 rounded-lg border-2 border-danger/40 bg-danger/10 px-3.5 py-3 text-sm font-medium text-danger">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}
      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? 'Memproses...' : 'Daftar Sekarang'}
      </Button>
      <p className="text-center text-xs text-ink-subtle font-medium leading-relaxed">
        Dengan daftar, kamu setuju dengan{' '}
        <a href="/syarat-ketentuan" className="text-brand-600 hover:text-brand-700 underline">Syarat & Ketentuan</a>
        {' '}&{' '}
        <a href="/kebijakan-privasi" className="text-brand-600 hover:text-brand-700 underline">Kebijakan Privasi</a>
        {' '}kami.
      </p>
    </form>
  )
}
