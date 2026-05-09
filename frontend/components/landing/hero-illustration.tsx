import Image from 'next/image'

const HERO_BANNER_URL =
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/hero-banner.webp'

/**
 * Hero illustration — generated 16:9 doodle art with multiple brand logos.
 * Match dengan style 16 product card thumbnails (Vexx-style + cream BG).
 */
export function HeroIllustration() {
  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl shadow-brand-900/30 ring-1 ring-white/40">
      <Image
        src={HERO_BANNER_URL}
        alt="Koleksi akun premium digital — Google, ChatGPT, Claude, Adobe, Canva, X, dan layanan eksklusif lainnya"
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
        className="object-cover"
      />
    </div>
  )
}
