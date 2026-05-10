'use client'

import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CountryCode = '62' | '60'

export const COUNTRIES: Array<{
  code: CountryCode
  dial: string
  flag: string
  label: string
  // Format hint untuk placeholder & error
  example: string
  // Min/max digit di belakang country code
  minLocal: number
  maxLocal: number
}> = [
  { code: '62', dial: '+62', flag: '🇮🇩', label: 'Indonesia', example: '812xxxxxxxx', minLocal: 9, maxLocal: 12 },
  { code: '60', dial: '+60', flag: '🇲🇾', label: 'Malaysia',   example: '12xxxxxxx',  minLocal: 9, maxLocal: 10 },
]

export function getCountry(code: CountryCode) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]
}

/**
 * Combine country dial code + local digits into normalized E.164 (no plus).
 * "12345678" + "62" → "6212345678"
 * Auto-strip leading 0 dari user input.
 */
export function buildPhoneE164(code: CountryCode, localDigits: string): string {
  const digits = localDigits.replace(/\D/g, '').replace(/^0+/, '')
  return `${code}${digits}`
}

/**
 * Parse stored phone_wa back to {code, local} untuk display di profile edit form.
 */
export function parsePhoneE164(stored: string | null | undefined): {
  code: CountryCode
  local: string
} {
  if (!stored) return { code: '62', local: '' }
  const digits = stored.replace(/\D/g, '')
  for (const c of COUNTRIES) {
    if (digits.startsWith(c.code)) {
      return { code: c.code as CountryCode, local: digits.slice(c.code.length) }
    }
  }
  // Fallback ID (legacy data)
  if (digits.startsWith('0')) return { code: '62', local: digits.slice(1) }
  return { code: '62', local: digits }
}

type Props = {
  code: CountryCode
  local: string
  onCodeChange: (code: CountryCode) => void
  onLocalChange: (local: string) => void
  onBlur?: () => void
  error?: boolean
  required?: boolean
  autoComplete?: string
  ariaLabel?: string
}

export function PhoneInput({
  code,
  local,
  onCodeChange,
  onLocalChange,
  onBlur,
  error,
  required,
  autoComplete = 'tel',
  ariaLabel,
}: Props) {
  const country = getCountry(code)
  const selectId = useId()

  return (
    <div
      className={cn(
        'flex w-full rounded-lg border-2 bg-white overflow-hidden focus-within:ring-2',
        error
          ? 'border-danger focus-within:border-danger focus-within:ring-danger/40'
          : 'border-black/15 focus-within:border-brand-500 focus-within:ring-brand-500/25',
      )}
    >
      <label htmlFor={selectId} className="sr-only">
        Pilih negara
      </label>
      <div className="relative shrink-0 border-r-2 border-black/10">
        <select
          id={selectId}
          value={code}
          onChange={(e) => onCodeChange(e.target.value as CountryCode)}
          className="appearance-none bg-brand-50/40 h-full pl-3 pr-8 text-[15px] font-bold text-ink focus:outline-none cursor-pointer"
          aria-label="Kode negara"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.dial}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
      </div>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        required={required}
        value={local}
        onChange={(e) => onLocalChange(e.target.value.replace(/\D/g, ''))}
        onBlur={onBlur}
        placeholder={country.example}
        aria-label={ariaLabel}
        maxLength={country.maxLocal}
        className="flex-1 min-w-0 px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal focus:outline-none bg-transparent"
      />
    </div>
  )
}

/**
 * Validate that local digits match country's expected length & starts dgn digit valid.
 * Untuk ID: mobile prefix 8 (62 + 8xx...)
 * Untuk MY: mobile prefix 1 (60 + 1xx...)
 */
export function isValidLocal(code: CountryCode, local: string): boolean {
  const digits = local.replace(/\D/g, '').replace(/^0+/, '')
  const country = getCountry(code)
  if (digits.length < country.minLocal || digits.length > country.maxLocal) return false
  if (code === '62' && !digits.startsWith('8')) return false
  if (code === '60' && !digits.startsWith('1')) return false
  return true
}
