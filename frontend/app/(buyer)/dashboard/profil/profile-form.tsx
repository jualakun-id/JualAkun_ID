'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  PhoneInput,
  buildPhoneE164,
  parsePhoneE164,
  isValidLocal,
  getCountry,
  type CountryCode,
} from '@/components/ui/phone-input'
import { api } from '@/lib/api'

type Props = {
  email: string
  fullName: string
  phoneWa: string
  referralCode: string
}

export function ProfileForm({ email, fullName, phoneWa, referralCode }: Props) {
  const parsed = parsePhoneE164(phoneWa)
  const [name, setName] = useState(fullName)
  const [phoneCode, setPhoneCode] = useState<CountryCode>(parsed.code)
  const [phoneLocal, setPhoneLocal] = useState(parsed.local)
  const [touchedPhone, setTouchedPhone] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const phoneValid = isValidLocal(phoneCode, phoneLocal)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouchedPhone(true)
    if (!phoneValid) {
      setError(null)
      return
    }
    setLoading(true)
    setSaved(false)
    setError(null)
    const result = await api.patch('/dashboard/profile', {
      full_name: name,
      phone_wa: buildPhoneE164(phoneCode, phoneLocal),
    })
    setLoading(false)
    if (result.ok) {
      setSaved(true)
    } else {
      setError(result.message ?? 'Gagal menyimpan')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email" hint="Tidak bisa diubah lewat form ini">
        <Input value={email} disabled />
      </Field>
      <Field label="Nama lengkap">
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field
        label="No. WhatsApp"
        hint="Wajib aktif — semua notifikasi pesanan & klaim garansi dikirim ke sini"
        error={
          touchedPhone && !phoneValid
            ? `Nomor ${getCountry(phoneCode).label} tidak valid (mulai dari ${
                phoneCode === '62' ? '8' : '1'
              })`
            : undefined
        }
      >
        <PhoneInput
          code={phoneCode}
          local={phoneLocal}
          onCodeChange={setPhoneCode}
          onLocalChange={setPhoneLocal}
          onBlur={() => setTouchedPhone(true)}
          error={touchedPhone && !phoneValid}
          required
          ariaLabel="Nomor WhatsApp"
        />
      </Field>
      <Field label="Kode referral kamu" hint="Bagikan ke teman — kamu & dia sama-sama dapat kredit">
        <Input value={referralCode} disabled className="font-mono uppercase tracking-wider" />
      </Field>
      {saved ? (
        <div className="flex items-center gap-2.5 rounded-lg border-2 border-success/40 bg-success/10 px-3.5 py-3 text-sm font-bold text-success">
          <CheckCircle2 size={16} />
          Profil tersimpan.
        </div>
      ) : null}
      {error ? (
        <div className="flex items-start gap-2.5 rounded-lg border-2 border-danger/40 bg-danger/10 px-3.5 py-3 text-sm font-medium text-danger">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}
      <Button type="submit" disabled={loading} size="lg">
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-bold text-ink">{label}</label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
          <AlertCircle size={12} strokeWidth={2.5} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-subtle font-medium leading-relaxed">{hint}</p>
      ) : null}
    </div>
  )
}
