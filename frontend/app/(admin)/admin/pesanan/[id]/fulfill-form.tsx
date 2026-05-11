'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = { orderId: string; productName: string }

/**
 * Form Fulfill Manual — admin input credentials yang baru di-beli dari supplier
 * lalu klik Kirim. Backend encrypt → simpan account_stock → update order →
 * trigger notif credentials ke buyer (email + WA).
 */
export function FulfillForm({ orderId, productName }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [credentials, setCredentials] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!credentials.trim()) {
      toast.error('Credentials wajib diisi')
      return
    }
    if (!confirm(`Kirim akun untuk pesanan ini?\n\nCredentials akan di-enkripsi dan dikirim ke buyer via email + WhatsApp.`)) {
      return
    }
    setLoading(true)
    const result = await api.post<{ ok: true; delivered: true }>(
      `/admin/orders/${orderId}/fulfill`,
      { credentials: credentials.trim(), note: note.trim() || undefined },
    )
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal fulfill order')
      return
    }
    toast.success('Akun berhasil dikirim ke buyer ✓')
    setCredentials('')
    setNote('')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-3 rounded-xl border-2 border-brand-400 bg-brand-50/60 p-5 shadow-[0_2px_0_rgba(0,0,0,0.9)]"
    >
      <div>
        <h3 className="font-heading text-lg font-extrabold text-ink">Fulfill Manual</h3>
        <p className="mt-1 text-xs text-ink-muted font-medium">
          Input credentials akun {productName} dari supplier. Setelah Kirim, sistem encrypt + simpan + notif buyer otomatis.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="credentials" className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          Credentials (email:password) <span className="text-danger">*</span>
        </label>
        <Input
          id="credentials"
          required
          placeholder="user@example.com:strongpassword123"
          value={credentials}
          onChange={(e) => setCredentials(e.target.value)}
          className="font-mono"
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="note" className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          Catatan untuk Buyer (opsional)
        </label>
        <Input
          id="note"
          placeholder="Contoh: Jangan ganti password / login via app mobile saja"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={loading}
        />
      </div>

      <Button type="submit" loading={loading} className="inline-flex items-center gap-2">
        <Send size={16} strokeWidth={2.25} />
        {loading ? 'Mengirim...' : 'Kirim ke Buyer'}
      </Button>
    </form>
  )
}
