'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

type Props = { referralCode: string | null }

// Match backend regex: ^(\+?62|0|8)\d{8,13}$
const PHONE_REGEX = /^(\+?62|0|8)\d{8,13}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldState = 'idle' | 'valid' | 'invalid'

function passwordScore(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'bg-gray-200' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4
  const labels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat']
  const colors = [
    'bg-gray-200',
    'bg-danger',
    'bg-warning',
    'bg-brand-500',
    'bg-success',
  ]
  return { score: clamped, label: labels[clamped], color: colors[clamped] }
}

export function RegisterForm({ referralCode }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWa, setPhoneWa] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCodeState, setReferralCodeState] = useState(referralCode ?? '')
  const [showPassword, setShowPassword] = useState(false)

  // Touched: only show error AFTER user has interacted with field (less noisy)
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phoneWa: false,
    password: false,
    confirmPassword: false,
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Per-field validation
  const nameValid = fullName.trim().length >= 2
  const emailValid = EMAIL_REGEX.test(email.trim())
  const phoneValid = phoneWa === '' || PHONE_REGEX.test(phoneWa.trim())
  const passwordValid = password.length >= 8
  const confirmValid = confirmPassword === password && confirmPassword.length > 0
  const pwScore = useMemo(() => passwordScore(password), [password])

  function fieldState(value: boolean, isTouched: boolean): FieldState {
    if (!isTouched) return 'idle'
    return value ? 'valid' : 'invalid'
  }

  const formValid = nameValid && emailValid && phoneValid && passwordValid && confirmValid

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({
      fullName: true,
      email: true,
      phoneWa: true,
      password: true,
      confirmPassword: true,
    })
    if (!formValid) return

    setError(null)
    setLoading(true)
    const result = await api.post<{ user_id: string; email: string; message: string }>(
      '/auth/register',
      {
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        phone_wa: phoneWa.trim() || undefined,
        referral_code: referralCodeState.trim() || undefined,
      },
      { auth: false },
    )
    setLoading(false)
    if (!result.ok) {
      setError(
        result.message?.toLowerCase().includes('already')
          ? 'Email ini sudah terdaftar. Coba login atau pakai email lain.'
          : (result.message ?? 'Gagal mendaftar'),
      )
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/masuk'), 2500)
  }

  if (success) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border-2 border-success/40 bg-success/10 px-4 py-4 text-sm font-medium text-success">
        <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Akun berhasil dibuat 🎉</p>
          <p className="mt-1">
            Cek email kamu untuk link verifikasi, lalu login. Kami arahkan ke halaman masuk dalam 2
            detik...
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field
        label="Nama lengkap"
        state={fieldState(nameValid, touched.fullName)}
        error={touched.fullName && !nameValid ? 'Min. 2 karakter' : undefined}
      >
        <Input
          required
          autoComplete="name"
          placeholder="Nama panggilanmu"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
          error={touched.fullName && !nameValid}
        />
      </Field>

      <Field
        label="Email"
        state={fieldState(emailValid, touched.email)}
        error={touched.email && !emailValid ? 'Format email tidak valid (contoh: kamu@email.com)' : undefined}
      >
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="kamu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={touched.email && !emailValid}
        />
      </Field>

      <Field
        label="No. WhatsApp"
        optional
        state={fieldState(phoneValid, touched.phoneWa && phoneWa !== '')}
        error={
          touched.phoneWa && !phoneValid
            ? 'Format: 08xxxxxxxxxx atau +62xxxxxxxxxx (10-15 digit)'
            : undefined
        }
      >
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="0812xxxxxxxx"
          value={phoneWa}
          onChange={(e) => setPhoneWa(e.target.value.replace(/\s+/g, ''))}
          onBlur={() => setTouched((t) => ({ ...t, phoneWa: true }))}
          error={touched.phoneWa && !phoneValid}
        />
      </Field>

      <Field
        label="Password"
        state={fieldState(passwordValid, touched.password)}
        error={touched.password && !passwordValid ? 'Min. 8 karakter' : undefined}
      >
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Min. 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={touched.password && !passwordValid}
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        </div>

        {/* Strength meter */}
        {password.length > 0 ? (
          <div className="mt-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-colors duration-200 ${
                    i <= pwScore.score ? pwScore.color : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {pwScore.label ? (
              <p className="mt-1.5 text-xs font-bold text-ink-muted">
                Kekuatan: <span className="text-ink">{pwScore.label}</span>
                <span className="ml-2 font-medium text-ink-subtle">
                  Tips: kombinasi huruf besar/kecil + angka + simbol
                </span>
              </p>
            ) : null}
          </div>
        ) : null}
      </Field>

      <Field
        label="Konfirmasi password"
        state={fieldState(confirmValid, touched.confirmPassword)}
        error={
          touched.confirmPassword && confirmPassword !== '' && !confirmValid
            ? 'Password tidak cocok'
            : undefined
        }
      >
        <Input
          type={showPassword ? 'text' : 'password'}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Ulang password yang sama"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
          error={touched.confirmPassword && confirmPassword !== '' && !confirmValid}
        />
      </Field>

      {referralCodeState ? (
        <Field label="Kode referral" state="idle">
          <Input
            value={referralCodeState}
            onChange={(e) => setReferralCodeState(e.target.value.toUpperCase())}
            className="font-mono uppercase"
          />
        </Field>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2.5 rounded-lg border-2 border-danger/40 bg-danger/10 px-3.5 py-3 text-sm font-medium text-danger">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={loading || !formValid}
        size="lg"
        className="w-full"
      >
        {loading ? 'Memproses...' : 'Daftar Sekarang'}
      </Button>

      <p className="text-center text-xs text-ink-subtle font-medium leading-relaxed">
        Dengan daftar, kamu setuju dengan{' '}
        <a href="/syarat-ketentuan" className="text-brand-600 hover:text-brand-700 underline">
          Syarat & Ketentuan
        </a>{' '}
        &{' '}
        <a href="/kebijakan-privasi" className="text-brand-600 hover:text-brand-700 underline">
          Kebijakan Privasi
        </a>{' '}
        kami.
      </p>
    </form>
  )
}

function Field({
  label,
  optional,
  state,
  error,
  children,
}: {
  label: string
  optional?: boolean
  state: FieldState
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-bold text-ink flex items-center gap-1.5">
        {label}
        {optional ? <span className="text-ink-subtle font-medium">(opsional)</span> : null}
        {state === 'valid' ? (
          <CheckCircle2 size={14} className="text-success ml-auto" strokeWidth={2.5} />
        ) : null}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
          <AlertCircle size={12} strokeWidth={2.5} />
          {error}
        </p>
      ) : null}
    </div>
  )
}
