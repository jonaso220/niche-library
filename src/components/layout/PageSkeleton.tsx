const SKELETON_SLOTS = Array.from({ length: 10 }, (_, i) => `slot-${String(i)}`)

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando página</span>
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-white/[0.05] animate-pulse" />
        <div className="h-8 w-64 rounded bg-white/[0.06] animate-pulse" />
        <div className="h-4 w-80 rounded bg-white/[0.04] animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {SKELETON_SLOTS.map(id => (
          <div
            key={id}
            className="aspect-[3/4] rounded-2xl border border-border/40 bg-white/[0.03] animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
