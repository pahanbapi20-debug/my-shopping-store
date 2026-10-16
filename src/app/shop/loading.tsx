export default function Loading() {
  return (
    <div>
      <div className="border-b border-cream-300 bg-cream-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-4">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-14 w-72 rounded-lg" />
          <div className="skeleton h-4 w-96 max-w-full rounded" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <div className="hidden lg:block space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-8 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton aspect-[3/4] rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
