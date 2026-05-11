'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ShoppingCart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = {
  orderId: string
  productName: string
  /** Apakah produk ini sudah di-link ke supplier — tombol "Beli dari Supplier" muncul kalau ada. */
  hasSupplier: boolean
}

/**
 * FulfillForm — admin paste seluruh info (credentials + instruksi) ke 1
 * textarea besar. Kalau produk punya supplier mapping, ada tombol "Beli dari
 * Supplier" yang auto-fill textarea dengan response dari supplier API.
 *
 * Backend simpan isi textarea sebagai `credentials` (di-encrypt) — semua info
 * untuk buyer dalam 1 block text (konsisten dengan request user: 1 parameter
 * note, tidak dipecah email/password/note terpisah).
 */
export function FulfillForm({ orderId, productName, hasSupplier }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  async function handlePurchaseFromSupplier() {
    if (!confirm('Beli dari supplier (Canboso)?\n\nWallet akan dipotong. Response akan masuk ke kolom Info Pesanan untuk kamu review sebelum dikirim ke buyer.')) {
      return
    }
    setPurchasing(true)
    const result = await api.post<{ raw: string; price_usd?: number }>(
      `/admin/orders/${orderId}/supplier-purchase`,
    )
    setPurchasing(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal beli dari supplier')
      return
    }
    // Append (bukan replace) supaya admin gak kehilangan ketikan sebelumnya
    setInfo((prev) => (prev ? `${prev}\n\n${result.data.raw}` : result.data.raw))
    toast.success(
      result.data.price_usd
        ? `Berhasil beli dari supplier ($${result.data.price_usd}). Review sebelum kirim.`
        : 'Berhasil beli dari supplier. Review sebelum kirim.',
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!info.trim()) {
      toast.error('Info Pesanan wajib diisi')
      return
    }
    if (!confirm('Kirim akun ke buyer?\n\nIsi info akan di-enkripsi dan dikirim via email + WhatsApp.')) {
      return
    }
    setLoading(true)
    const result = await api.post<{ ok: true; delivered: true }>(
      `/admin/orders/${orderId}/fulfill`,
      { credentials: info.trim() },
    )
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal fulfill order')
      return
    }
    toast.success('Akun berhasil dikirim ke buyer ✓')
    setInfo('')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-3 rounded-xl border-2 border-brand-400 bg-brand-50/60 p-5 shadow-[0_2px_0_rgba(0,0,0,0.9)]"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-lg font-extrabold text-ink">Fulfill Manual</h3>
          {hasSupplier ? (
            <button
              type="button"
              onClick={handlePurchaseFromSupplier}
              disabled={purchasing || loading}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-white px-3 py-1.5 text-xs font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:bg-brand-50 hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {purchasing ? (
                <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
              ) : (
                <ShoppingCart size={14} strokeWidth={2.5} />
              )}
              {purchasing ? 'Membeli...' : 'Beli dari Supplier'}
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-ink-muted font-medium">
          Input semua info untuk buyer di kolom bawah ({productName}): email, password, link, instruksi — bebas format. Klik <strong>Kirim</strong>{' '}
          untuk encrypt + simpan + notif email/WA.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="info" className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          Info Pesanan untuk Buyer <span className="text-danger">*</span>
        </label>
        <textarea
          id="info"
          required
          rows={8}
          placeholder={
            'Contoh:\n\nEmail: user@example.com\nPassword: strongPass123\n\nCatatan: Login via app mobile saja. Jangan ganti password.'
          }
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-sm font-mono text-ink placeholder:text-ink-subtle placeholder:font-normal placeholder:font-sans focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:opacity-50"
        />
      </div>

      <Button type="submit" loading={loading} className="inline-flex items-center gap-2">
        <Send size={16} strokeWidth={2.25} />
        {loading ? 'Mengirim...' : 'Kirim ke Buyer'}
      </Button>
    </form>
  )
}
