'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
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
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = {
  email: string
  fullName: string
  phoneWa: string
  referralCode: string
}

export function ProfileForm({ email, fullName, phoneWa, referralCode }: Props) {
  const toast = useToast()
  const parsed = parsePhoneE164(phoneWa)
  const [name, setName] = useState(fullName)
  const [phoneCode, setPhoneCode] = useState<CountryCode>(parsed.code)
  const [phoneLocal, setPhoneLocal] = useState(parsed.local)
  const [touchedPhone, setTouchedPhone] = useState(false)
  const [loading, setLoading] = useState(false)

  const phoneValid = isValidLocal(phoneCode, phoneLocal)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouchedPhone(true)
    if (!phoneValid) return
    setLoading(true)
    const result = await api.patch('/dashboard/profile', {
      full_name: name,
      phone_wa: buildPhoneE164(phoneCode, phoneLocal),
    })
    setLoading(false)
    if (result.ok) {
      toast.success('Profil tersimpan ✓')
    } else {
      toast.error(result.message ?? 'Gagal menyimpan profil')
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
      <Button type="submit" loading={loading} size="lg">
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
