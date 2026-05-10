'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from './confirm-dialog'

type Props = {
  label: string
  /** Headline modal (default: "Konfirmasi") */
  confirmTitle?: string
  /** Body modal — bisa diisi pertanyaan/penjelasan (was: confirmMessage) */
  confirmMessage: string
  /** Tombol submit di modal (default: "Konfirmasi") */
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  variant?: 'primary' | 'danger' | 'secondary'
  disabled?: boolean
}

/**
 * Tombol yang trigger ConfirmDialog modal sebelum eksekusi.
 * Replacement untuk pattern window.confirm() native — UX sticker style + a11y.
 */
export function ConfirmButton({
  label,
  confirmTitle = 'Konfirmasi',
  confirmMessage,
  confirmLabel,
  onConfirm,
  variant = 'primary',
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={disabled} variant={variant}>
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel ?? label}
        variant={variant === 'danger' ? 'danger' : 'primary'}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => !loading && setOpen(false)}
      />
    </>
  )
}
