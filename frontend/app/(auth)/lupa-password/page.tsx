import { ForgotForm } from './forgot-form'

export const metadata = { title: 'Lupa Password' }

export default function LupaPasswordPage() {
  return (
    <>
      <h1 className="font-heading text-h2">Lupa Password</h1>
      <p className="mt-2 text-sm text-text-muted">
        Masukkan email Anda. Kami akan kirim link reset password.
      </p>
      <div className="mt-6">
        <ForgotForm />
      </div>
    </>
  )
}
