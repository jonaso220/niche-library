import { Link } from 'react-router'
import { useCollectionStats, useCollectionPerfumes } from '@/db/hooks'
import { SHELF_DEFINITIONS } from '@/lib/constants'
import { Library, Heart, TrendingUp, Database, ChevronRight, Search, ArrowRight } from 'lucide-react'
import { PerfumeCard } from '@/components/perfume/PerfumeCard'

export function CollectionOverview() {
  const stats = useCollectionStats()
  const allPerfumes = useCollectionPerfumes()

  const recentlyAdded = allPerfumes
    ?.filter(p => p.collectionData.owned)
    .sort((a, b) => b.collectionData.addedAt.localeCompare(a.collectionData.addedAt))
    .slice(0, 5)

  const topRated = allPerfumes
    ?.filter(p => p.collectionData.owned)
    .sort((a, b) => b.effectiveRating - a.effectiveRating)
    .slice(0, 5)

  const shelfPreviews = ['season-spring', 'season-summer', 'season-fall', 'season-winter'].map(id => {
    const shelf = SHELF_DEFINITIONS.find(s => s.id === id)!
    const items = allPerfumes?.filter(shelf.filterFn).sort((a, b) => b.effectiveRating - a.effectiveRating).slice(0, 5) ?? []
    return { shelf, items }
  })

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <p className="text-gold-dim text-xs font-bold uppercase tracking-[0.15em] mb-1.5">Bienvenido</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
          Tu Colección
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Library className="w-4.5 h-4.5" />}
          color="gold"
          label="En Colección"
          value={stats?.totalInCollection ?? 0}
        />
        <StatCard
          icon={<Heart className="w-4.5 h-4.5" />}
          color="rose"
          label="Lista de Deseos"
          value={stats?.totalWishlist ?? 0}
        />
        <StatCard
          icon={<TrendingUp className="w-4.5 h-4.5" />}
          color="green"
          label="Rating Promedio"
          value={stats?.avgRating ?? 0}
          decimal
        />
        <StatCard
          icon={<Database className="w-4.5 h-4.5" />}
          color="blue"
          label="En Catálogo"
          value={stats?.totalCatalog ?? 0}
        />
      </div>

      {/* Recently Added */}
      {recentlyAdded && recentlyAdded.length > 0 && (
        <ShelfPreview title="Agregados Recientemente" items={recentlyAdded} to="/shelf/all" />
      )}

      {/* Top Rated */}
      {topRated && topRated.length > 0 && (
        <ShelfPreview title="Mejor Valorados" items={topRated} to="/shelf/top-rated" />
      )}

      {/* Season previews */}
      {shelfPreviews.map(({ shelf, items }) =>
        items.length > 0 ? (
          <ShelfPreview
            key={shelf.id}
            title={shelf.label}
            items={items}
            to={`/shelf/${shelf.id}`}
          />
        ) : null
      )}

      {/* Empty state */}
      {stats?.totalInCollection === 0 && (
        <div className="mt-6">
          <div className="relative overflow-hidden rounded-2xl border border-gold/10 p-10 md:p-14">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.06] via-accent-emerald/[0.03] to-accent-purple/[0.04] shimmer-bg" />
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gold/[0.04] blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-accent-emerald/[0.04] blur-[60px]" />

            <div className="relative flex flex-col items-center text-center max-w-lg mx-auto">
              <div className="relative mb-6">
                <img src="/icon-192.png" alt="" className="w-20 h-20 rounded-2xl shadow-xl shadow-black/30" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                <div className="absolute -inset-2 rounded-3xl bg-gold/[0.06] blur-xl" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-3 gradient-text">
                Comienza tu colección
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-md">
                Tenemos <span className="text-gold font-bold">{stats?.totalCatalog ?? 0} perfumes</span> en el catálogo listos para explorar.
                Busca tus favoritos y agrégalos a tu biblioteca personal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-gold to-gold-bright text-background rounded-xl font-bold text-sm glow-gold hover:shadow-xl hover:shadow-gold/20 hover:scale-[1.02] transition-all"
                >
                  <Search className="w-4 h-4" />
                  Explorar Catálogo
                </Link>
                <Link
                  to="/add"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/[0.06] border border-white/[0.10] rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/[0.09] hover:border-white/[0.15] transition-all"
                >
                  Agregar Manual
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const COLOR_MAP = {
  gold:  { gradient: 'from-gold/15 to-gold/5', text: 'text-gold', border: 'border-gold/20', glow: 'shadow-gold/8', iconBg: 'bg-gold/15' },
  rose:  { gradient: 'from-accent-rose/15 to-accent-rose/5', text: 'text-accent-rose', border: 'border-accent-rose/20', glow: 'shadow-accent-rose/8', iconBg: 'bg-accent-rose/15' },
  green: { gradient: 'from-accent-green/15 to-accent-green/5', text: 'text-accent-green', border: 'border-accent-green/20', glow: 'shadow-accent-green/8', iconBg: 'bg-accent-green/15' },
  blue:  { gradient: 'from-accent-blue/15 to-accent-blue/5', text: 'text-accent-blue', border: 'border-accent-blue/20', glow: 'shadow-accent-blue/8', iconBg: 'bg-accent-blue/15' },
}

function StatCard({ icon, color, label, value, decimal }: {
  icon: React.ReactNode
  color: keyof typeof COLOR_MAP
  label: string
  value: number
  decimal?: boolean
}) {
  const c = COLOR_MAP[color]
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${c.gradient} border ${c.border} rounded-2xl p-4 hover:shadow-lg ${c.glow} transition-all duration-200 card-lift`}>
      <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center mb-3`}>
        <span className={c.text}>{icon}</span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-text-primary leading-none">
        {decimal ? value.toFixed(1) : value}
      </p>
      <p className="text-[11px] text-text-muted mt-1.5 font-semibold tracking-wide">{label}</p>
    </div>
  )
}

function ShelfPreview({ title, items, to }: {
  title: string
  items: import('@/types/perfume').ShelfPerfume[]
  to: string
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold tracking-tight text-text-primary">{title}</h2>
        <Link
          to={to}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-gold font-medium transition-colors"
        >
          Ver todo
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3">
        {items.map(perfume => (
          <PerfumeCard key={perfume.id} perfume={perfume} showSeasons={false} />
        ))}
      </div>
    </section>
  )
}
