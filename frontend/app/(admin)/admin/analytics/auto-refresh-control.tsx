'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Play, Pause } from 'lucide-react'

const INTERVAL_OPTIONS = [
  { value: 30, label: '30 detik' },
  { value: 60, label: '1 menit' },
  { value: 300, label: '5 menit' },
]

/**
 * Auto-refresh control: manual button + toggle auto-refresh dengan interval
 * selector. State di-persist di localStorage supaya bertahan saat navigasi.
 */
export function AutoRefreshControl() {
  const router = useRouter()
  const [enabled, setEnabled] = useState(false)
  const [interval, setIntervalSec] = useState(60)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const savedEnabled = localStorage.getItem('analytics_auto_refresh') === 'true'
    const savedInterval = parseInt(localStorage.getItem('analytics_refresh_interval') ?? '60', 10)
    setEnabled(savedEnabled)
    setIntervalSec(savedInterval)
    setLastRefresh(new Date())
  }, [])

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => {
      setRefreshing(true)
      router.refresh()
      setLastRefresh(new Date())
      setTimeout(() => setRefreshing(false), 600)
    }, interval * 1000)
    return () => clearInterval(id)
  }, [enabled, interval, router])

  function toggleEnabled() {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem('analytics_auto_refresh', String(next))
  }

  function changeInterval(v: number) {
    setIntervalSec(v)
    localStorage.setItem('analytics_refresh_interval', String(v))
  }

  function manualRefresh() {
    setRefreshing(true)
    router.refresh()
    setLastRefresh(new Date())
    setTimeout(() => setRefreshing(false), 600)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Manual refresh button */}
      <button
        type="button"
        onClick={manualRefresh}
        disabled={refreshing}
        title={lastRefresh ? `Last refresh: ${lastRefresh.toLocaleTimeString('id-ID')}` : 'Refresh sekarang'}
        className="inline-flex items-center gap-1.5 rounded-md border-2 border-black/15 bg-white px-2.5 py-1.5 text-xs font-bold text-ink-muted hover:border-brand-400 hover:text-brand-700 disabled:opacity-50"
      >
        <RefreshCw size={12} strokeWidth={2.5} className={refreshing ? 'animate-spin' : ''} />
        Refresh
      </button>

      {/* Auto-refresh toggle + interval */}
      <div className={`inline-flex items-center gap-1.5 rounded-md border-2 px-2.5 py-1.5 text-xs font-bold transition-colors ${enabled ? 'border-black bg-success/10 text-success' : 'border-black/15 bg-white text-ink-muted'}`}>
        <button
          type="button"
          onClick={toggleEnabled}
          title={enabled ? 'Matikan auto-refresh' : 'Nyalakan auto-refresh'}
          className="inline-flex items-center gap-1"
        >
          {enabled ? <Pause size={12} strokeWidth={2.5} /> : <Play size={12} strokeWidth={2.5} />}
          Auto
        </button>
        {enabled ? (
          <select
            value={interval}
            onChange={(e) => changeInterval(Number(e.target.value))}
            className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer"
          >
            {INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  )
}
