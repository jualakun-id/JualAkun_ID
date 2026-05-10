'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

type Props = {
  open: boolean
  title: string
  description?: string
  size?: Size
  onClose: () => void
  /** Set true untuk disable close via backdrop/ESC (mis. saat sedang loading submit) */
  preventClose?: boolean
  children: React.ReactNode
  /** Slot kanan atas untuk metadata (mis. badge status) */
  rightSlot?: React.ReactNode
}

/**
 * Modal — sticker-style centered popup untuk form / detail panjang.
 * Scrollable body kalau content overflow viewport height.
 *
 * Pakai untuk: tambah produk, edit kupon, detail panjang, dll.
 * Untuk konfirmasi destructive sederhana, pakai ConfirmDialog.
 */
export function Modal({
  open,
  title,
  description,
  size = 'xl',
  onClose,
  preventClose,
  children,
  rightSlot,
}: Props) {
  useEffect(() => {
    if (!open) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !preventClose) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, preventClose, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8 animate-fade-in"
      onClick={() => !preventClose && onClose()}
    >
      <div
        className={`w-full ${SIZE_CLASS[size]} max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl border-2 border-black bg-white shadow-[0_6px_0_rgba(0,0,0,0.9)] animate-pop-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — sticky atas */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b-2 border-black/10 shrink-0">
          <div className="min-w-0 flex-1">
            <h2
              id="modal-title"
              className="font-heading text-xl sm:text-2xl font-extrabold text-ink tracking-tight"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-ink-muted font-medium leading-snug">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {rightSlot}
            <button
              type="button"
              onClick={onClose}
              disabled={preventClose}
              aria-label="Tutup"
              className="rounded-md p-1.5 text-ink-muted hover:bg-gray-100 hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Body — scrollable kalau overflow */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
