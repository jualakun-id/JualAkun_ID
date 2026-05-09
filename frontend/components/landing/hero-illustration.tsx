import { BrandLogo } from './brand-logo'

/**
 * Hero illustration — flat-design composition of orbiting brand logos
 * around a central device. Replaces the placeholder grid.
 */
export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md aspect-square mx-auto">
      {/* Soft glow background */}
      <div
        aria-hidden="true"
        className="absolute inset-4 rounded-full bg-white/20 blur-2xl"
      />

      {/* Central device card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-56 sm:w-52 sm:h-64 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3 p-5">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
          <span className="text-brand-700 font-black text-2xl">J</span>
        </div>
        <div className="text-center">
          <div className="text-ink font-bold text-sm">jualakun.id</div>
          <div className="text-ink-subtle text-[11px]">Akses semua langganan</div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {[
            'bg-red-500', 'bg-green-500', 'bg-blue-500',
            'bg-purple-500', 'bg-pink-500', 'bg-yellow-500',
          ].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${c}`} />
          ))}
        </div>
      </div>

      {/* Floating brand logos — positioned around the device */}
      <FloatBadge style="top-2 left-1/2 -translate-x-1/2" delay="0s">
        <BrandLogo brand="netflix" size={28} />
      </FloatBadge>
      <FloatBadge style="top-1/4 right-2" delay="0.4s">
        <BrandLogo brand="spotify" size={28} />
      </FloatBadge>
      <FloatBadge style="bottom-1/4 right-2" delay="0.8s">
        <BrandLogo brand="youtube" size={28} />
      </FloatBadge>
      <FloatBadge style="bottom-2 left-1/2 -translate-x-1/2" delay="1.2s">
        <BrandLogo brand="chatgpt" size={28} />
      </FloatBadge>
      <FloatBadge style="bottom-1/4 left-2" delay="1.6s">
        <BrandLogo brand="canva" size={28} />
      </FloatBadge>
      <FloatBadge style="top-1/4 left-2" delay="2s">
        <BrandLogo brand="disneyplus" size={28} />
      </FloatBadge>
    </div>
  )
}

function FloatBadge({
  children,
  style,
  delay,
}: {
  children: React.ReactNode
  style: string
  delay: string
}) {
  return (
    <div
      className={`absolute ${style} bg-white rounded-2xl shadow-lg w-12 h-12 flex items-center justify-center animate-float`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  )
}
