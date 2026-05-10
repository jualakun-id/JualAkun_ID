export default function Loading() {
  return (
    <div className="bg-white">
      {/* Hero skeleton */}
      <div className="bg-sky-hero py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="h-7 w-48 bg-white/30 rounded-full animate-pulse" />
            <div className="h-12 sm:h-14 w-3/4 bg-white/40 rounded-xl animate-pulse" />
            <div className="h-12 sm:h-14 w-1/2 bg-white/40 rounded-xl animate-pulse" />
            <div className="h-5 w-full max-w-md bg-white/25 rounded animate-pulse" />
            <div className="h-5 w-4/5 max-w-md bg-white/25 rounded animate-pulse" />
            <div className="flex gap-3 mt-6">
              <div className="h-12 w-40 bg-white/40 rounded-lg animate-pulse" />
              <div className="h-12 w-36 bg-white/30 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="w-72 h-72 bg-white/20 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats skeleton — 4 sticker cards 4:3 */}
      <div className="container mx-auto px-4 max-w-6xl py-16 md:py-20">
        <div className="text-center">
          <div className="h-9 w-64 mx-auto bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-80 mx-auto mt-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-xl border-2 border-black/10 bg-gray-50 animate-pulse shadow-[0_3px_0_rgba(0,0,0,0.08)]"
            />
          ))}
        </div>
      </div>

      {/* Products skeleton — sticker cards 3:4 */}
      <div className="bg-brand-50/40 py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <div className="h-9 w-72 mx-auto bg-brand-100 rounded animate-pulse" />
            <div className="h-5 w-96 mx-auto mt-4 bg-brand-50 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl border-2 border-black/10 bg-white shadow-[0_3px_0_rgba(0,0,0,0.08)] p-4 flex flex-col gap-3 animate-pulse"
              >
                <div className="h-1/2 rounded-lg border-2 border-black/10 bg-gray-100" />
                <div className="flex-1 flex flex-col items-center gap-2 px-1.5">
                  <div className="h-4 w-4/5 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-brand-50 rounded-full mt-1" />
                  <div className="h-5 w-24 bg-gray-200 rounded mt-2" />
                  <div className="h-3 w-32 bg-gray-100 rounded mt-1" />
                  <div className="h-9 w-full bg-gray-100 rounded-lg mt-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cara Pesan skeleton */}
      <div className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <div className="h-9 w-56 mx-auto bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-24 h-28 rounded-3xl bg-brand-50 animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
