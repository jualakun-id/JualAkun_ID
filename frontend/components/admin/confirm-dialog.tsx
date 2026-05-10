'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * ConfirmDialog — sticker-style modal untuk konfirmasi destructive action.
 * Replacement untuk window.confirm() native.
 *
 * - Click outside / ESC → cancel
 * - Focus trap-style: confirm button auto-focused saat open
 * - aria-modal + aria-labelledby + aria-describedby untuk a11y
 * - Backdrop blur subtle (visual hierarchy)
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  const confirmClass =
    variant === 'danger'
      ? 'bg-danger hover:bg-danger/90 text-white'
      : 'bg-brand-500 hover:bg-brand-400 text-ink'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full max-w-md rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_6px_0_rgba(0,0,0,0.9)] animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 shrink-0 ${
              variant === 'danger'
                ? 'bg-danger/15 text-danger border-danger/40'
                : 'bg-warning/15 text-warning border-warning/40'
            }`}
          >
            <AlertTriangle size={20} strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-title"
              className="font-heading text-lg font-extrabold text-ink tracking-tight"
            >
              {title}
            </h3>
            <p
              id="confirm-desc"
              className="mt-1.5 text-sm text-ink-muted font-medium leading-relaxed"
            >
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Tutup dialog"
            className="rounded-md p-1 text-ink-muted hover:bg-gray-100 hover:text-ink disabled:opacity-50"
          >
            <X size={18} strokeWidth={2.25} />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-white hover:bg-gray-50 text-ink font-extrabold px-5 py-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`${confirmClass} font-extrabold px-5 py-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm disabled:opacity-60 disabled:pointer-events-none`}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
