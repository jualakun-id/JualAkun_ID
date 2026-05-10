'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'

const IDLE_TIMEOUT_MS = 15 * 60 * 1000 // 15 menit
const WARNING_BEFORE_MS = 60 * 1000 // tampilkan warning 1 menit sebelum logout
const ACTIVITY_EVENTS: Array<keyof DocumentEventMap> = [
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
]

/**
 * IdleLogout — auto-logout user kalau tidak ada aktivitas selama 15 menit.
 *
 * - Listen 5 jenis user activity (throttled di sisi browser via single ref)
 * - 14 menit no activity → tampilkan warning modal dgn 60 detik countdown
 * - 15 menit total no activity → signOut + redirect /masuk?reason=idle
 * - Reduced-motion safe (no animation di modal)
 * - Cleanup listeners on unmount (penting untuk SPA navigation)
 */
export function IdleLogout() {
  const router = useRouter()
  const lastActivityRef = useRef<number>(Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [warningVisible, setWarningVisible] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(60)

  useEffect(() => {
    function recordActivity() {
      lastActivityRef.current = Date.now()
      if (warningVisible) setWarningVisible(false)
    }

    ACTIVITY_EVENTS.forEach((evt) => {
      document.addEventListener(evt, recordActivity, { passive: true })
    })

    intervalRef.current = setInterval(async () => {
      const idleMs = Date.now() - lastActivityRef.current

      if (idleMs >= IDLE_TIMEOUT_MS) {
        // Logout — lewati segala hal lain
        if (intervalRef.current) clearInterval(intervalRef.current)
        const supabase = createBrowserClient()
        await supabase.auth.signOut()
        router.push('/masuk?reason=idle')
        router.refresh()
        return
      }

      const msUntilLogout = IDLE_TIMEOUT_MS - idleMs
      if (msUntilLogout <= WARNING_BEFORE_MS) {
        setWarningVisible(true)
        setSecondsLeft(Math.max(0, Math.ceil(msUntilLogout / 1000)))
      }
    }, 1000)

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => document.removeEventListener(evt, recordActivity))
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [router, warningVisible])

  if (!warningVisible) return null

  return (
    <div
      role="alertdialog"
      aria-labelledby="idle-warning-title"
      aria-describedby="idle-warning-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-sm rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_6px_0_rgba(0,0,0,0.9)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/15 text-warning border-2 border-warning/40 shrink-0">
            <AlertTriangle size={20} strokeWidth={2.25} />
          </div>
          <div className="flex-1">
            <h3
              id="idle-warning-title"
              className="font-heading text-lg font-extrabold text-ink tracking-tight"
            >
              Sesi akan berakhir
            </h3>
            <p id="idle-warning-desc" className="mt-1.5 text-sm text-ink-muted font-medium leading-relaxed">
              Akun kamu akan otomatis logout dalam <strong className="text-ink tabular-nums">{secondsLeft}</strong> detik karena tidak ada aktivitas. Klik di mana saja untuk tetap login.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
