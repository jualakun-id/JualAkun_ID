/**
 * Loading skeleton untuk semua route /admin/* — match sticker style.
 * Next.js otomatis pakai ini saat route segment loading (Suspense boundary).
 */
export default function AdminLoading() {
  return (
    <div className="px-6 md:px-8 py-8">
      {/* Header skeleton */}
      <div className="mb-7">
        <div className="h-9 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="mt-3 h-4 w-72 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Stat row skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border-2 border-black/10 bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.08)] animate-pulse"
          >
            <div className="h-10 w-10 rounded-xl bg-brand-50" />
            <div className="mt-4 h-3 w-24 bg-gray-100 rounded" />
            <div className="mt-2 h-7 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="mt-6 rounded-2xl border-2 border-black/10 bg-white p-3 shadow-[0_3px_0_rgba(0,0,0,0.08)] animate-pulse">
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-brand-50 rounded-md" />
          <div className="h-8 w-20 bg-gray-100 rounded-md" />
          <div className="h-8 w-20 bg-gray-100 rounded-md" />
          <div className="h-8 flex-1 max-w-xs bg-gray-100 rounded-lg ml-auto" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="mt-4 rounded-2xl border-2 border-black/10 bg-white shadow-[0_3px_0_rgba(0,0,0,0.08)] overflow-hidden animate-pulse">
        <div className="bg-brand-50/50 h-11 border-b-2 border-black/5" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b border-black/5 last:border-b-0"
          >
            <div className="h-4 flex-1 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
