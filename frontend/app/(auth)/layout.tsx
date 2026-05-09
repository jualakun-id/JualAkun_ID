export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-glow">
        {children}
      </div>
    </div>
  )
}
