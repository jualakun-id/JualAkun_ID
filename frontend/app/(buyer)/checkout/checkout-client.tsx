'use client'

import Image from 'next/image'
import Script from 'next/script'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Lock, ShieldCheck, Tag, Wallet } from 'lucide-react'
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
      // POP SDK belum siap — fallback ke halaman hosted Duitku
      window.location.href = result.data.payment_url
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_360px]">
      <Script src={POP_SRC} strategy="afterInteractive" />

      {/* Detail card */}
      <div className="rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_4px_0_rgba(0,0,0,0.9)]">
        <h2 className="font-heading text-xl md:text-2xl font-extrabold text-ink tracking-tight">
          Detail Pesanan
        </h2>
        <div className="mt-5 flex gap-4">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl border-2 border-black/15 bg-brand-50">
            {product.thumbnail_url ? (
              <Image src={product.thumbnail_url} alt={product.name} fill sizes="112px" className="object-cover" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading text-lg font-extrabold text-ink leading-tight">{product.name}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">
                {product.duration_days} hari
              </span>
              {product.guarantee_days > 0 ? (
                <span className="inline-flex items-center gap-1 bg-success/10 text-success px-2.5 py-1 rounded-full">
                  <ShieldCheck size={11} strokeWidth={2.5} />
                  Garansi {product.guarantee_days}d
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-warning/15 text-warning px-2.5 py-1 rounded-full">
                  Tanpa garansi
                </span>
              )}
            </div>
            <div className="mt-3 font-heading font-extrabold text-ink text-xl">
              {formatRupiah(product.price)}
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <div>
            <label className="text-sm font-bold text-ink flex items-center gap-1.5">
              <Tag size={14} className="text-brand-600" strokeWidth={2.5} />
              Kode kupon <span className="text-ink-subtle font-medium">(opsional)</span>
            </label>
            <Input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="HEMAT10"
              className="mt-2 font-mono uppercase"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-ink">No. WhatsApp untuk notifikasi</label>
            <Input
              type="tel"
              value={phoneWa}
              onChange={(e) => setPhoneWa(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="mt-2"
            />
            <p className="mt-1.5 text-xs text-ink-subtle font-medium">
              Notifikasi pembayaran & delivery dikirim ke nomor ini
            </p>
          </div>
          <label className="flex items-start gap-3 rounded-lg border-2 border-black/15 bg-brand-50/40 p-3.5 cursor-pointer hover:border-brand-400 transition-colors">
            <input
              type="checkbox"
              checked={useCredits}
              onChange={(e) => setUseCredits(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-500 cursor-pointer"
            />
            <span className="flex-1">
              <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <Wallet size={14} className="text-brand-600" strokeWidth={2.5} />
                Pakai kredit referral saya
              </span>
              <span className="text-xs text-ink-muted font-medium block mt-0.5">
                Saldo otomatis dipotong sesuai available balance
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_4px_0_rgba(0,0,0,0.9)] h-fit md:sticky md:top-24">
        <h2 className="font-heading text-xl font-extrabold text-ink tracking-tight">Ringkasan</h2>
        <div className="mt-4 space-y-2.5 text-[15px]">
          <Row label="Harga produk" value={formatRupiah(product.price)} />
          <Row label="Diskon" value="Hitung saat bayar" muted />
          <hr className="border-black/10 border-dashed" />
          <Row label="Total" value={formatRupiah(product.price)} bold />
        </div>
        {error ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border-2 border-danger/40 bg-danger/10 px-3.5 py-3 text-sm font-medium text-danger">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}
        <Button
          onClick={handleCheckout}
          disabled={loading || product.stock_count === 0}
          size="lg"
          className="mt-6 w-full"
        >
          {loading ? 'Memproses...' : 'Bayar Sekarang →'}
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-muted font-medium">
          <Lock size={11} strokeWidth={2.5} />
          Pembayaran aman via Duitku
        </p>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string
  value: string
  muted?: boolean
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? 'text-ink-subtle font-medium' : 'text-ink-muted font-medium'}>
        {label}
      </span>
      <span className={bold ? 'font-heading font-extrabold text-ink text-lg' : 'text-ink font-bold'}>
        {value}
      </span>
    </div>
  )
}
