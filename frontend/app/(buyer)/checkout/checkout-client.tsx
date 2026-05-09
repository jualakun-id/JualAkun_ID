'use client'

import Image from 'next/image'
import Script from 'next/script'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatRupiah } from '@/lib/utils'

type Product = {
  id: string
  name: string
  slug: string
  thumbnail_url: string | null
  price: number
  duration_days: number
  guarantee_days: number
  stock_count: number
}

type CreateOrderResponse = {
  order_id: string
  order_number: string
  amount_idr: number
  discount_idr: number
  credit_used_idr: number
  total_idr: number
  payment_reference: string
  payment_url: string
  va_number: string | null
  qr_string: string | null
  expires_at: string
}

type DuitkuResult = {
  merchantOrderId?: string
  reference?: string
  resultCode?: string
}

declare global {
  interface Window {
    checkout?: {
      process: (
        reference: string,
        callbacks: {
          successEvent?: (r: DuitkuResult) => void
          pendingEvent?: (r: DuitkuResult) => void
          errorEvent?: (r: DuitkuResult) => void
          closeEvent?: (r: DuitkuResult) => void
        },
      ) => void
    }
  }
}

const IS_PROD = process.env.NEXT_PUBLIC_DUITKU_IS_PRODUCTION === 'true'
const POP_SRC = IS_PROD
  ? 'https://app-prod.duitku.com/lib/js/duitku.min.js'
  : 'https://app-sandbox.duitku.com/lib/js/duitku.min.js'

export function CheckoutClient({ product }: { product: Product }) {
  const router = useRouter()
  const [coupon, setCoupon] = useState('')
  const [phoneWa, setPhoneWa] = useState('')
  const [useCredits, setUseCredits] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setError(null)
    setLoading(true)
    const result = await api.post<CreateOrderResponse>('/checkout/create-order', {
      product_id: product.id,
      coupon_code: coupon || undefined,
      use_credits: useCredits,
      phone_wa: phoneWa || undefined,
    })
    setLoading(false)
    if (!result.ok) {
      setError(result.message ?? 'Gagal membuat order')
      return
    }
    if (window.checkout?.process) {
      window.checkout.process(result.data.payment_reference, {
        successEvent: () => router.push(`/checkout/selesai?order_id=${result.data.order_id}`),
        pendingEvent: () => router.push(`/checkout/selesai?order_id=${result.data.order_id}`),
        errorEvent: () => setError('Pembayaran gagal. Silakan coba lagi.'),
        closeEvent: () => router.push(`/dashboard/pesanan/${result.data.order_id}`),
      })
    } else {
      // POP SDK belum siap (script gagal load) — fallback ke halaman hosted Duitku.
      window.location.href = result.data.payment_url
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <Script src={POP_SRC} strategy="afterInteractive" />

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-heading text-h3">Detail Pesanan</h2>
        <div className="mt-4 flex gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
            {product.thumbnail_url ? (
              <Image src={product.thumbnail_url} alt={product.name} fill sizes="80px" className="object-cover" />
            ) : null}
          </div>
          <div>
            <div className="font-heading text-h4">{product.name}</div>
            <div className="mt-1 text-sm text-text-muted">
              Durasi {product.duration_days} hari · Garansi {product.guarantee_days} hari
            </div>
            <div className="mt-2 font-heading font-bold text-primary">{formatRupiah(product.price)}</div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-text-muted">Kode kupon (opsional)</label>
            <Input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="HEMAT10"
              className="mt-1.5 font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-muted">No. WhatsApp (untuk notifikasi)</label>
            <Input
              type="tel"
              value={phoneWa}
              onChange={(e) => setPhoneWa(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="mt-1.5"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={useCredits}
              onChange={(e) => setUseCredits(e.target.checked)}
              className="rounded border-border"
            />
            Pakai kredit referral saya
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-heading text-h3">Ringkasan</h2>
        <div className="mt-4 space-y-2 text-sm">
          <Row label="Harga produk" value={formatRupiah(product.price)} />
          <Row label="Diskon" value="—" muted />
          <hr className="border-border-subtle" />
          <Row label="Total" value={formatRupiah(product.price)} bold />
        </div>
        {error ? (
          <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        ) : null}
        <Button onClick={handleCheckout} disabled={loading || product.stock_count === 0} className="mt-6 w-full">
          {loading ? 'Memproses...' : 'Bayar Sekarang'}
        </Button>
        <p className="mt-3 text-center text-xs text-text-subtle">
          Diskon kupon & kredit otomatis dihitung saat klik bayar.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-text-subtle' : 'text-text-muted'}>{label}</span>
      <span className={bold ? 'font-heading font-bold text-primary' : 'text-text'}>{value}</span>
    </div>
  )
}
