'use client'

import { useEffect, useState } from 'react'

type Props = { expiresAt: string }

/**
 * Countdown sampai order expire (24h timer). Update tiap 30 detik, gak perlu
 * realtime per-detik karena context-nya rough estimate untuk admin awareness.
 */
export function ExpiresCountdown({ expiresAt }: Props) {
  const [remaining, setRemaining] = useState(() => Date.parse(expiresAt) - Date.now())

  useEffect(() => {
    const tick = () => setRemaining(Date.parse(expiresAt) - Date.now())
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (remaining <= 0) {
    return <span className="text-danger font-bold">Sudah expired</span>
  }

  const hours = Math.floor(remaining / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  const tone = hours < 2 ? 'text-danger' : hours < 6 ? 'text-warning' : 'text-ink'

  return (
    <span className={`font-bold tabular-nums ${tone}`}>
      {hours > 0 ? `${hours}j ` : ''}{minutes}m lagi
    </span>
  )
}
