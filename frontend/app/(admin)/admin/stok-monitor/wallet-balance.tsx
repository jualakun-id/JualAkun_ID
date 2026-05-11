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
      <div className="inline-flex items-center gap-2 rounded-lg border-2 border-black/15 bg-white px-3 py-2 text-xs">
        <Wallet size={14} strokeWidth={2.5} className="text-ink-subtle" />
        <span className="font-bold text-ink-muted">Saldo: —</span>
      </div>
    )
  }

  const usd = balance.balance_usd
  const tone =
    usd < 2
      ? 'border-danger/40 bg-danger/10 text-danger'
      : usd < 10
        ? 'border-warning/50 bg-warning/10 text-warning'
        : 'border-success/40 bg-success/10 text-success'
  const isLow = usd < 2

  return (
    <a
      href="https://t.me/CanbosoBot"
      target="_blank"
      rel="noopener noreferrer"
      title="Klik untuk top-up via bot Canboso di Telegram"
      className={`inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-extrabold hover:-translate-y-0.5 transition-transform ${tone}`}
    >
      {isLow ? <AlertTriangle size={14} strokeWidth={2.5} /> : <Wallet size={14} strokeWidth={2.5} />}
      <span>Saldo Canboso: {balance.balance_text}</span>
      {isLow ? <span className="text-[10px] font-bold uppercase">Top-up!</span> : null}
    </a>
  )
}
