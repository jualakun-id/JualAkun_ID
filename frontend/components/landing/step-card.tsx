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
 * StepCard — kalau `imageSrc` di-set → render Vexx illustration 1:1.
 * Fallback ke `icon` Lucide untuk backward compat.
 */
export function StepCard(props: Props) {
  const isImage = 'imageSrc' in props && props.imageSrc

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-brand-50 border-2 border-black overflow-hidden shadow-[0_3px_0_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-150 group-hover:-translate-y-1 group-hover:shadow-[0_5px_0_rgba(0,0,0,0.9)]">
        {isImage ? (
          <Image
            src={(props as WithImage).imageSrc}
            alt={(props as WithImage).imageAlt ?? props.label}
            fill
            sizes="(min-width: 640px) 112px, 96px"
            className="object-cover"
          />
        ) : (
          (() => {
            const Icon = (props as WithIcon).icon
            return <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
          })()
        )}
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-500 border-2 border-black text-ink text-sm font-extrabold flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.9)]">
          {props.num}
        </div>
      </div>
      <div className="text-center">
        <div className="text-ink font-bold text-[15px]">{props.label}</div>
      </div>
    </div>
  )
}
