type Props = { score: number }

export function HealthScore({ score }: Props) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const dash = (clamped / 100) * circumference
  const tier = clamped >= 80 ? 'Sehat' : clamped >= 60 ? 'Cukup' : 'Kritis'
  const color = clamped >= 80 ? '#0F8F4F' : clamped >= 60 ? '#F5A623' : '#D9304B'

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-6 text-center shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="text-sm text-ink-muted font-bold uppercase tracking-wider">Health Score</div>
      <svg viewBox="0 0 160 160" className="mx-auto mt-3 h-40 w-40 -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="#E5E7EB" strokeWidth="14" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          fill="none"
        />
      </svg>
      <div className="-mt-24 mb-16 font-heading text-5xl font-extrabold text-ink tracking-tight tabular-nums">
        {clamped}
      </div>
      <div className="text-sm font-extrabold uppercase tracking-wider" style={{ color }}>
        {tier}
      </div>
    </div>
  )
}
