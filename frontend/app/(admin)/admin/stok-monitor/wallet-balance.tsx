import { Wallet, AlertTriangle, Coins } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah } from '@/lib/utils'
import { ExchangeRateEditor } from './exchange-rate-editor'

type Balance = {
  balance_usd: number
  balance_text: string
  balance_idr: number
  exchange_rate: number
  updated_at: string
}

/**
 * Header info: 3 card sejajar — Saldo USD · Saldo IDR (× kurs) · Kurs Aktif.
 * Kurs aktif clickable → modal edit. Update kurs hanya berlaku untuk
 * fulfill berikutnya, order lama tetap pakai cost_idr historis.
 */
export async function WalletBalance() {
  const balance = await adminFetch<Balance | null>('/admin/supplier/balance')

  if (!balance) {
    return (
      <div className="flex flex-wrap items-end gap-2">
        <SimpleCard icon={<Wallet size={16} strokeWidth={2.5} />} label="Saldo USD" value="—" tone="muted" />
        <SimpleCard icon={<Coins size={16} strokeWidth={2.5} />} label="Saldo IDR" value="—" tone="muted" />
        <ExchangeRateEditor initialRate={null} />
      </div>
    )
  }

  const usd = balance.balance_usd
  const usdTone = usd < 2 ? 'danger' : usd < 10 ? 'warning' : 'success'

  return (
    <div className="flex flex-wrap items-end gap-2">
      {/* Saldo USD */}
      <a
        href="https://t.me/CanbosoBot"
        target="_blank"
        rel="noopener noreferrer"
        title="Klik untuk top-up via bot Canboso di Telegram"
        className={`flex flex-col gap-0.5 rounded-lg border-2 border-black px-3.5 py-2 text-sm font-extrabold shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all ${toneClass(usdTone)}`}
      >
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide opacity-80">
          {usd < 2 ? <AlertTriangle size={12} strokeWidth={2.5} /> : <Wallet size={12} strokeWidth={2.5} />}
          Saldo USD
        </span>
        <span className="text-base tabular-nums">
          {balance.balance_text}
          {usd < 2 ? <span className="ml-1.5 rounded bg-white/25 px-1 py-0.5 text-[9px] uppercase">Top-up!</span> : null}
        </span>
      </a>

      {/* Saldo IDR (computed) */}
      <div className="flex flex-col gap-0.5 rounded-lg border-2 border-black bg-white px-3.5 py-2 text-sm font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)]">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
          <Coins size={12} strokeWidth={2.5} />
          Saldo IDR
        </span>
        <span className="text-base tabular-nums">{formatRupiah(balance.balance_idr)}</span>
      </div>

      {/* Kurs Aktif (clickable → modal edit) */}
      <ExchangeRateEditor initialRate={balance.exchange_rate} />
    </div>
  )
}

function SimpleCard({
  icon,
  label,
  value,
  tone = 'muted',
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'muted' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div className={`flex flex-col gap-0.5 rounded-lg border-2 border-black px-3.5 py-2 text-sm font-extrabold shadow-[0_2px_0_rgba(0,0,0,0.9)] ${toneClass(tone)}`}>
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide opacity-80">
        {icon}
        {label}
      </span>
      <span className="text-base tabular-nums">{value}</span>
    </div>
  )
}

function toneClass(tone: 'muted' | 'success' | 'warning' | 'danger'): string {
  switch (tone) {
    case 'success':
      return 'bg-success text-white'
    case 'warning':
      return 'bg-warning text-ink'
    case 'danger':
      return 'bg-danger text-white'
    default:
      return 'bg-white text-ink-muted'
  }
}
