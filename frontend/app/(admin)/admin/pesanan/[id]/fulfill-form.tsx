'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ShoppingCart, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = {
  orderId: string
  productName: string
  hasSupplier: boolean
}

type CostSource = 'supplier_canboso' | 'manual' | 'unknown'

/**
 * FulfillForm — admin paste seluruh info ke 1 textarea + capture modal
 * pembelian (wajib) untuk profit tracking. Kalau "Beli dari Supplier",
 * modal auto-fill dari response Canboso (USD × kurs). Admin tetap bisa
 * edit modal manual sebelum kirim.
 */
export function FulfillForm({ orderId, productName, hasSupplier }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [info, setInfo] = useState('')
  const [costIdr, setCostIdr] = useState<string>('')
  const [costUsd, setCostUsd] = useState<number | null>(null)
  const [costSource, setCostSource] = useState<CostSource>('manual')
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  async function handlePurchaseFromSupplier() {
    if (!confirm('Beli dari supplier (Canboso)?\n\nWallet akan dipotong. Response & modal akan auto-fill — review sebelum kirim ke buyer.')) {
      return
    }
    setPurchasing(true)
    const result = await api.post<{ raw: string; cost_usd: number | null; cost_idr: number | null }>(
      `/admin/orders/${orderId}/supplier-purchase`,
    )
    setPurchasing(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal beli dari supplier')
      return
    }
    setInfo((prev) => (prev ? `${prev}\n\n${result.data.raw}` : result.data.raw))
    if (result.data.cost_idr !== null) {
      setCostIdr(String(result.data.cost_idr))
      setCostUsd(result.data.cost_usd)
      setCostSource('supplier_canboso')
      toast.success(
        `Berhasil beli dari supplier${result.data.cost_usd ? ` ($${result.data.cost_usd})` : ''}. Modal auto-fill — review sebelum kirim.`,
      )
    } else {
      toast.success('Berhasil beli dari supplier. Modal tidak terdeteksi otomatis — input manual.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!info.trim()) {
      toast.error('Info Pesanan wajib diisi')
      return
    }
    const cost = Number(costIdr)
    if (!costIdr || Number.isNaN(cost) || cost < 0) {
      toast.error('Modal pembelian wajib diisi (Rp, boleh 0 kalau gratis)')
      return
    }
    if (!confirm('Kirim akun ke buyer?\n\nIsi info akan di-enkripsi dan dikirim via email + WhatsApp. Modal akan tercatat untuk hitung profit.')) {
      return
    }
    setLoading(true)
    const result = await api.post<{ ok: true; delivered: true }>(
      `/admin/orders/${orderId}/fulfill`,
      {
        credentials: info.trim(),
        cost_idr: cost,
        cost_usd: costUsd ?? undefined,
        cost_source: costSource,
      },
    )
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal fulfill order')
      return
    }
    toast.success('Akun berhasil dikirim ke buyer ✓')
    setInfo('')
    setCostIdr('')
    setCostUsd(null)
    setCostSource('manual')
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
          Input semua info untuk buyer + modal pembelian ({productName}). Modal wajib untuk hitung profit.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="info" className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          Info Pesanan untuk Buyer <span className="text-danger">*</span>
        </label>
        <textarea
          id="info"
          required
          rows={7}
          placeholder={
            'Contoh:\n\nEmail: user@example.com\nPassword: strongPass123\n\nCatatan: Login via app mobile saja.'
          }
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-sm font-mono text-ink placeholder:text-ink-subtle placeholder:font-normal placeholder:font-sans focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:opacity-50"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="cost_idr" className="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Modal Pembelian (Rp) <span className="text-danger">*</span>
          </label>
          <Input
            id="cost_idr"
            type="number"
            min={0}
            required
            value={costIdr}
            onChange={(e) => {
              setCostIdr(e.target.value)
              setCostSource('manual')
              setCostUsd(null)
            }}
            placeholder="50000"
            disabled={loading}
          />
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs text-ink-subtle font-medium leading-relaxed">
            {costSource === 'supplier_canboso' ? (
              <span className="text-success">✓ Auto-fill dari supplier{costUsd ? ` ($${costUsd})` : ''}</span>
            ) : (
              'Sumber: input manual. Boleh 0 kalau gratis / promo.'
            )}
          </p>
        </div>
      </div>

      <Button type="submit" loading={loading} className="inline-flex items-center gap-2">
        <Send size={16} strokeWidth={2.25} />
        {loading ? 'Mengirim...' : 'Kirim ke Buyer'}
      </Button>
    </form>
  )
}
