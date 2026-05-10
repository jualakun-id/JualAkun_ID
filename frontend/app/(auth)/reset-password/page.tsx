import { ResetForm } from './reset-form'

export const metadata = { title: 'Reset Password' }

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Bikin password baru</h1>
      <p className="mt-2 text-[15px] text-ink-muted font-medium">
        Pilih password yang kuat & tidak kamu pakai di akun lain.
      </p>
      <div className="mt-7">
        <ResetForm />
      </div>
    </>
  )
}
