type Props = { score: number }

export function HealthScore({ score }: Props) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const dash = (clamped / 100) * circumference
  const tier = clamped >= 80 ? 'Sehat' : clamped >= 60 ? 'Cukup' : 'Kritis'
  const color = clamped >= 80 ? '#10B981' : clamped >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div className="rounded-xl border border-border bg-surface p-6 text-center">
      <div className="text-sm text-text-muted">Health Score</div>
      <svg viewBox="0 0 160 160" className="mx-auto mt-3 h-40 w-40 -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="#27272A" strokeWidth="12" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          fill="none"
        />
      </svg>
      <div className="-mt-24 mb-16 font-heading text-h1 text-text">{clamped}</div>
      <div className="text-sm font-semibold" style={{ color }}>
        {tier}
      </div>
    </div>
  )
}
