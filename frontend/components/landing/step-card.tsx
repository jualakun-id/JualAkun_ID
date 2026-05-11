import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'

type BaseProps = {
  num: number
  label: string
}

type WithIcon = BaseProps & { icon: LucideIcon; imageSrc?: never; imageAlt?: never }
type WithImage = BaseProps & { imageSrc: string; imageAlt?: string; icon?: never }

type Props = WithIcon | WithImage

/**
 * StepCard — kalau `imageSrc` di-set → render Vexx illustration 1:1 (image
 * sudah include nomor di dalamnya, jadi badge nomor external tidak
 * di-render). Fallback ke `icon` Lucide + badge nomor untuk backward compat.
 */
export function StepCard(props: Props) {
  const isImage = 'imageSrc' in props && props.imageSrc

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-3xl bg-brand-50 border-2 border-black overflow-hidden shadow-[0_3px_0_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-150 group-hover:-translate-y-1 group-hover:shadow-[0_5px_0_rgba(0,0,0,0.9)]">
        {isImage ? (
          <Image
            src={(props as WithImage).imageSrc}
            alt={(props as WithImage).imageAlt ?? props.label}
            fill
            sizes="(min-width: 1280px) 288px, (min-width: 768px) 256px, (min-width: 640px) 224px, 160px"
            className="object-cover"
          />
        ) : (
          <>
            {(() => {
              const Icon = (props as WithIcon).icon
              return <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
            })()}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-500 border-2 border-black text-ink text-sm font-extrabold flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.9)]">
              {props.num}
            </div>
          </>
        )}
      </div>
      <div className="text-center">
        <div className="text-ink font-bold text-[15px]">{props.label}</div>
      </div>
    </div>
  )
}
