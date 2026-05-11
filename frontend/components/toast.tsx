'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info'

type Toast = {
  id: number
  variant: ToastVariant
  message: string
}

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return ctx
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; className: string; iconClassName: string }
> = {
  success: {
    icon: CheckCircle2,
    className: 'bg-success border-black text-white',
    iconClassName: 'text-white',
  },
  error: {
    icon: AlertTriangle,
    className: 'bg-danger border-black text-white',
    iconClassName: 'text-white',
  },
  info: {
    icon: Info,
    className: 'bg-brand-500 border-black text-ink',
    iconClassName: 'text-ink',
  },
}

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = Date.now() + Math.random()
      setToasts((list) => [...list, { id, variant, message }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 left-4 z-[60] flex flex-col-reverse gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const cfg = VARIANT_CONFIG[toast.variant]
  const Icon = cfg.icon
  const [exiting, setExiting] = useState(false)

  // Trigger exit animation 200ms before actual dismiss
  useEffect(() => {
    const t = setTimeout(() => setExiting(true), AUTO_DISMISS_MS - 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border-2 ${cfg.className} px-4 py-3 shadow-[0_4px_0_rgba(0,0,0,0.9)] min-w-[300px] max-w-md transition-all duration-200 ${
        exiting ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0 animate-pop-in'
      }`}
    >
      <Icon size={20} className={`shrink-0 mt-0.5 ${cfg.iconClassName}`} strokeWidth={2.75} />
      <p className="flex-1 text-sm font-extrabold leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className={`shrink-0 rounded p-0.5 hover:bg-black/15 ${cfg.iconClassName}`}
      >
        <X size={16} strokeWidth={3} />
      </button>
    </div>
  )
}
