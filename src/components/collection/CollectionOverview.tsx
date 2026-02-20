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
    <div className="space-y-8 max-w-6xl">
      {/* Hero */}
      <div>
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Bienvenido</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
          Tu Colección
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <StatCard
          icon={<Library className="w-4 h-4" />}
          color="gold"
          label="En Colección"
          value={stats?.totalInCollection ?? 0}
        />
        <StatCard
          icon={<Heart className="w-4 h-4" />}
          color="rose"
          label="Lista de Deseos"
          value={stats?.totalWishlist ?? 0}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          color="green"
          label="Rating Promedio"
          value={stats?.avgRating ?? 0}
          decimal
        />
        <StatCard
          icon={<Database className="w-4 h-4" />}
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
        <div className="mt-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/[0.06] via-transparent to-accent-emerald/[0.04] border border-gold/10 p-8 md:p-12">
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gold/[0.04] blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent-emerald/[0.04] blur-2xl" />

            <div className="relative flex flex-col items-center text-center max-w-md mx-auto">
              <img src="/icon-192.png" alt="" className="w-16 h-16 rounded-2xl mb-5 opacity-80" />
              <h2 className="text-xl font-bold tracking-tight mb-2">
                Comienza tu colección
              </h2>
              <p className="text-text-muted text-sm leading-relaxed mb-6">
                Tenemos {stats?.totalCatalog ?? 0} perfumes en el catálogo listos para explorar.
                Busca tus favoritos y agrégalos a tu biblioteca personal.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-background rounded-lg font-semibold text-sm hover:bg-gold-bright glow-gold"
                >
                  <Search className="w-4 h-4" />
                  Explorar Catálogo
                </Link>
                <Link
                  to="/add"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.06]"
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
  gold:  { bg: 'bg-gold/8', text: 'text-gold', accent: 'bg-gold' },
  rose:  { bg: 'bg-accent-rose/8', text: 'text-accent-rose', accent: 'bg-accent-rose' },
  green: { bg: 'bg-accent-green/8', text: 'text-accent-green', accent: 'bg-accent-green' },
  blue:  { bg: 'bg-accent-blue/8', text: 'text-accent-blue', accent: 'bg-accent-blue' },
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
    <div className="relative overflow-hidden bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5 group hover:bg-white/[0.05] transition-colors">
      <div className={`absolute top-0 left-0 w-full h-[2px] ${c.accent} opacity-20 group-hover:opacity-40 transition-opacity`} />
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
          <span className={c.text}>{icon}</span>
        </div>
      </div>
      <p className="text-xl font-bold tracking-tight text-text-primary leading-none">
        {decimal ? value.toFixed(1) : value}
      </p>
      <p className="text-[11px] text-text-muted mt-1">{label}</p>
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold tracking-tight text-text-primary">{title}</h2>
        <Link
          to={to}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-gold transition-colors"
        >
          Ver todo
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {items.map(perfume => (
          <PerfumeCard key={perfume.id} perfume={perfume} showSeasons={false} />
        ))}
      </div>
    </section>
  )
}
