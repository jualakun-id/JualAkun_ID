'use client'

import { useState } from 'react'
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
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
      <Field label="Email"><Input value={email} disabled /></Field>
      <Field label="Nama lengkap">
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="No. WhatsApp">
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxxxxxx" />
      </Field>
      <Field label="Kode referral kamu">
        <Input value={referralCode} disabled className="font-mono" />
      </Field>
      {saved ? (
        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Profil tersimpan.
        </div>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-muted">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}
