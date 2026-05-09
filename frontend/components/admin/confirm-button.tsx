'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  label: string
  confirmMessage: string
  onConfirm: () => Promise<void> | void
  variant?: 'primary' | 'danger' | 'secondary'
  disabled?: boolean
}

export function ConfirmButton({ label, confirmMessage, onConfirm, variant = 'primary', disabled }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!confirm(confirmMessage)) return
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={disabled || loading} variant={variant}>
      {loading ? 'Memproses...' : label}
    </Button>
  )
}
