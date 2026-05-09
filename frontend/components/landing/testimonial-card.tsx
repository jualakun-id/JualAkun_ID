import { Star } from 'lucide-react'

export function TestimonialCard({
  name,
  handle,
  text,
  rating = 5,
  avatarColor = '#0089A8',
}: {
  name: string
  handle: string
  text: string
  rating?: number
  avatarColor?: string
}) {
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-3 h-full text-center md:text-left">
      <div className="flex items-center gap-3 justify-center md:justify-start">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: avatarColor }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0 text-left">
          <div className="text-ink font-semibold text-sm truncate">{name}</div>
          <div className="text-ink-subtle text-xs truncate">{handle}</div>
        </div>
      </div>
      <div className="flex gap-0.5 justify-center md:justify-start" aria-label={`${rating} dari 5 bintang`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-ink-muted text-sm leading-relaxed flex-1">{text}</p>
    </div>
  )
}
