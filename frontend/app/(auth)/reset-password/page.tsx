import { ResetForm } from './reset-form'

export const metadata = { title: 'Reset Password' }

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="font-heading text-h2">Reset Password</h1>
      <p className="mt-2 text-sm text-ink-muted">Buat password baru untuk akun Anda.</p>
      <div className="mt-6">
        <ResetForm />
      </div>
    </>
  )
}
