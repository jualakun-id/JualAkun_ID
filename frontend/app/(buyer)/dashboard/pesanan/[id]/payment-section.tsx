'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { Copy, Check, Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import { formatRupiah } from '@/lib/utils'

type PaymentQrResponse = {
  order_id: string
  order_number: string
  total_idr: number
  unique_suffix: number
  qris_dynamic_payload: string
  expires_at: string
  status: string
  payment_claimed_at: string | null
}

/**
 * Payment section untuk order status pending_payment / verifying.
 *
 * Flow:
 *  - pending_payment: tampil QR + amount + tombol "Saya sudah bayar"
 *  - verifying:       tampil "Menunggu verifikasi admin" + countdown polling
 *  - Polling tiap 10 detik untuk detect saat admin verify → status paid.
 *    Auto router.refresh() ketika status berubah supaya seluruh page re-render
 *    dengan UI baru (e.g. "Pembayaran diterima").
 */
export function PaymentSection({
  orderId,
  initialStatus,
}: {
  orderId: string
  initialStatus: string
}) {
  const router = useRouter()
  const toast = useToast()
  const [payment, setPayment] = useState<PaymentQrResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [claiming, setClaiming] = useState(false)

  const fetchPayment = useCallback(async () => {
    const result = await api.get<PaymentQrResponse>(`/orders/${orderId}/payment-qr`)
    if (!result.ok) {
      setError(result.message ?? 'Gagal load pembayaran')
      setLoading(false)
      return
    }
    setPayment(result.data)
    setError(null)
    setLoading(false)
    // Kalau status berubah ke paid/cancelled (admin sudah verify/reject),
    // refresh page untuk render UI baru
    if (result.data.status !== initialStatus && result.data.status !== 'pending_payment' && result.data.status !== 'verifying') {
      router.refresh()
    }
  }, [orderId, initialStatus, router])

  useEffect(() => {
    fetchPayment()
  }, [fetchPayment])

  // Polling tiap 10 detik untuk detect status change (admin verify/reject)
  useEffect(() => {
    if (initialStatus !== 'pending_payment' && initialStatus !== 'verifying') return
    const interval = setInterval(() => {
      fetchPayment()
    }, 10_000)
    return () => clearInterval(interval)
  }, [initialStatus, fetchPayment])

  async function handleClaimPaid() {
    if (!confirm('Konfirmasi: Anda sudah transfer dengan nominal yang sesuai? Admin akan verifikasi mutasi GoPay dalam 5-15 menit (jam 09:00-22:00 WIB).')) return
    setClaiming(true)
    const result = await api.post(`/orders/${orderId}/claim-paid`)
    setClaiming(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal submit klaim')
      return
    }
    toast.success('Klaim diterima. Admin akan verifikasi dalam 5-15 menit.')
    router.refresh()
  }

  async function handleCopyAmount() {
    if (!payment) return
    await navigator.clipboard.writeText(String(payment.total_idr))
    setCopied(true)
    toast.success('Nominal disalin ke clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] flex items-center justify-center gap-2 text-ink-muted">
        <Loader2 size={18} className="animate-spin" />
        <span>Memuat info pembayaran...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 rounded-2xl border-2 border-danger bg-danger/5 p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)] flex items-start gap-3">
        <AlertCircle size={20} className="shrink-0 mt-0.5 text-danger" />
        <div>
          <div className="font-extrabold text-danger">Gagal memuat pembayaran</div>
          <p className="mt-1 text-sm text-ink-muted">{error}</p>
        </div>
      </div>
    )
  }

  if (!payment) return null

  // Status verifying — buyer sudah klaim, nunggu admin
  if (payment.status === 'verifying') {
    return (
      <div className="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <div className="flex items-start gap-3">
          <Loader2 size={20} strokeWidth={2.5} className="shrink-0 mt-0.5 text-amber-600 animate-spin" />
          <div className="flex-1">
            <div className="font-extrabold text-ink text-base">
              Menunggu verifikasi admin
            </div>
            <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
              Klaim pembayaran Anda sudah masuk. Admin akan cek mutasi GoPay dan verifikasi nominal{' '}
              <strong className="text-ink">{formatRupiah(payment.total_idr)}</strong> dalam <strong>5-15 menit</strong> (jam 09:00-22:00 WIB).
            </p>
            <p className="mt-2 text-[12px] text-ink-subtle">
              Halaman ini auto-refresh tiap 10 detik. Pesanan dilanjutkan otomatis setelah verifikasi sukses.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Status pending_payment — tampil QR + tombol klaim
  return (
    <div className="mt-6 rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <h2 className="font-heading text-xl md:text-2xl font-extrabold text-ink tracking-tight">
        Pembayaran via QRIS
      </h2>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed">
        Scan QR di bawah dengan app <strong>GoPay / OVO / DANA / ShopeePay</strong> atau e-wallet QRIS lain. Nominal sudah otomatis terisi.
      </p>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
            <QRCode
              value={payment.qris_dynamic_payload}
              size={220}
              level="M"
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
          <p className="text-[11px] text-ink-subtle font-medium text-center">
            QR berlaku sampai pesanan kedaluwarsa
          </p>
        </div>

        {/* Amount + Instructions */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs text-ink-muted font-bold uppercase tracking-wide">Nominal yang harus dibayar</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
                {formatRupiah(payment.total_idr)}
              </div>
              <button
                type="button"
                onClick={handleCopyAmount}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 underline decoration-dashed"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Disalin' : 'Salin'}
              </button>
            </div>
            <p className="mt-1.5 text-[12px] text-ink-muted leading-relaxed">
              <strong className="text-ink">Penting:</strong> Transfer <strong>persis</strong> {formatRupiah(payment.total_idr)} — angka <strong>{payment.unique_suffix.toString().padStart(3, '0')}</strong> di belakang adalah kode unik agar pesanan Anda ke-identifikasi otomatis.
            </p>
          </div>

          <div className="rounded-lg border-2 border-black/15 bg-brand-50/40 p-3">
            <div className="text-xs font-bold text-ink mb-1.5">Langkah pembayaran:</div>
            <ol className="text-[13px] text-ink-muted space-y-1 list-decimal list-inside">
              <li>Scan QR pakai app e-wallet Anda</li>
              <li>Pastikan nominal sesuai <strong className="text-ink">{formatRupiah(payment.total_idr)}</strong></li>
              <li>Bayar di app</li>
              <li>Klik tombol "Saya sudah bayar" di bawah</li>
            </ol>
          </div>

          <button
            type="button"
            onClick={handleClaimPaid}
            disabled={claiming}
            className="w-full bg-brand-500 hover:bg-brand-400 text-ink font-extrabold py-3 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all text-sm disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
          >
            {claiming ? <Loader2 size={16} className="animate-spin" /> : null}
            {claiming ? 'Memproses...' : 'Saya sudah bayar'}
          </button>

          <p className="text-[11px] text-ink-subtle text-center leading-relaxed">
            Verifikasi admin: <strong>5-15 menit</strong> (jam 09:00-22:00 WIB).<br/>
            Di luar jam ini, verifikasi mungkin sampai pagi.
          </p>
        </div>
      </div>
    </div>
  )
}
