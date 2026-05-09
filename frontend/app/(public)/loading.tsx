export default function Loading() {
  return (
    <div className="bg-white">
      {/* Hero skeleton */}
      <div className="bg-sky-hero py-24">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="h-6 w-56 bg-white/30 rounded-full animate-pulse" />
            <div className="h-12 w-3/4 bg-white/40 rounded-lg animate-pulse" />
            <div className="h-12 w-1/2 bg-white/40 rounded-lg animate-pulse" />
            <div className="h-4 w-full max-w-md bg-white/30 rounded animate-pulse" />
            <div className="h-12 w-44 bg-white/40 rounded-lg animate-pulse mt-6" />
          </div>
          <div className="hidden md:flex justify-center">
            <div className="w-72 h-72 bg-white/20 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="container mx-auto px-4 max-w-6xl py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Products skeleton */}
      <div className="bg-brand-50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
