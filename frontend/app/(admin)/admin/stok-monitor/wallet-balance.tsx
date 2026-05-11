import { Wallet, AlertTriangle } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

type Balance = {
  balance_usd: number
  balance_text: string
  updated_at: string
}

/**
 * Wallet balance Canboso supplier — tampil di header stok-monitor.
 * Warna pill berubah sesuai threshold: hijau >$10, kuning $2–$10, merah <$2.
 * Auto-fetch on every page load (no cache) supaya angka selalu fresh.
 */
export async function WalletBalance() {
  const balance = await adminFetch<Balance | null>('/admin/supplier/balance')
  if (!balance) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3.5 py-2 text-sm font-extrabold text-ink-muted shadow-[0_2px_0_rgba(0,0,0,0.9)]">
          <Wallet size={16} strokeWidth={2.5} />
          <span>Saldo: —</span>
        </div>
        <p className="text-[10px] font-medium text-ink-subtle leading-tight">
          Supplier offline
        </p>
      </div>
    )
  }

  const usd = balance.balance_usd
  // Sticker style: solid bg + border-2 black + shadow biar match SupplierSyncButton
  const tone =
    usd < 2
      ? 'bg-danger text-white'
      : usd < 10
        ? 'bg-warning text-ink'
        : 'bg-success text-white'
  const isLow = usd < 2

  return (
    <div className="flex flex-col items-end gap-1">
      <a
        href="https://t.me/CanbosoBot"
        target="_blank"
        rel="noopener noreferrer"
        title="Klik untuk top-up via bot Canboso di Telegram"
        className={`inline-flex items-center gap-2 rounded-lg border-2 border-black px-3.5 py-2 text-sm font-extrabold shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all ${tone}`}
      >
        {isLow ? <AlertTriangle size={16} strokeWidth={2.5} /> : <Wallet size={16} strokeWidth={2.5} />}
        <span>Saldo: {balance.balance_text}</span>
        {isLow ? <span className="ml-1 rounded-md bg-white/25 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">Top-up!</span> : null}
      </a>
      <p className="text-[10px] font-medium text-ink-subtle leading-tight">
        Klik untuk top-up
      </p>
    </div>
  )
}
