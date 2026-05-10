'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

type Props = {
  email: string
  fullName: string
  phoneWa: string
  referralCode: string
}

export function ProfileForm({ email, fullName, phoneWa, referralCode }: Props) {
  const [name, setName] = useState(fullName)
  const [phone, setPhone] = useState(phoneWa)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    const result = await api.patch('/dashboard/profile', {
      full_name: name,
      phone_wa: phone || undefined,
    })
    setLoading(false)
    if (result.ok) setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email" hint="Tidak bisa diubah lewat form ini">
        <Input value={email} disabled />
      </Field>
      <Field label="Nama lengkap">
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="No. WhatsApp" hint="Untuk notifikasi pembayaran & delivery">
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxxxxxx" />
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
      <Button type="submit" disabled={loading} size="lg">
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-bold text-ink">{label}</label>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1.5 text-xs text-ink-subtle font-medium">{hint}</p> : null}
    </div>
  )
}
