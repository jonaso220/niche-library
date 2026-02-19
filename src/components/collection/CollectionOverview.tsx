import { Link } from 'react-router'
import { useCollectionStats, useCollectionPerfumes } from '@/db/hooks'
import { SHELF_DEFINITIONS } from '@/lib/constants'
import { Library, Heart, TrendingUp, Database, ChevronRight, Search, Sparkles } from 'lucide-react'
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Tu <span className="gradient-text">Colección</span>
        </h1>
        <p className="text-text-secondary text-sm">Tu biblioteca personal de fragancias</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Library className="w-5 h-5" />}
          iconColor="text-gold"
          iconBg="bg-gold/10"
          label="En Colección"
          value={stats?.totalInCollection ?? 0}
        />
        <StatCard
          icon={<Heart className="w-5 h-5" />}
          iconColor="text-accent-rose"
          iconBg="bg-accent-rose/10"
          label="Lista de Deseos"
          value={stats?.totalWishlist ?? 0}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="text-accent-green"
          iconBg="bg-accent-green/10"
          label="Rating Promedio"
          value={stats?.avgRating ?? 0}
          decimal
        />
        <StatCard
          icon={<Database className="w-5 h-5" />}
          iconColor="text-accent-blue"
          iconBg="bg-accent-blue/10"
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
            Tu colección está vacía
          </h2>
          <p className="text-text-muted mb-8 max-w-md text-sm leading-relaxed">
            Comienza buscando perfumes en el catálogo y agrégalos a tu colección.
            Tenemos más de {stats?.totalCatalog ?? 0} perfumes pre-cargados.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-background rounded-xl font-semibold text-sm hover:bg-gold-bright shadow-lg shadow-gold/20"
          >
            <Search className="w-4 h-4" />
            Explorar Catálogo
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, iconColor, iconBg, label, value, decimal }: {
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  label: string
  value: number
  decimal?: boolean
}) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.06] transition-colors">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-text-primary">
        {decimal ? value.toFixed(1) : value}
      </p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
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
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h2>
        <Link
          to={to}
          className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-gold transition-colors"
        >
          Ver todo
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map(perfume => (
          <PerfumeCard key={perfume.id} perfume={perfume} showSeasons={false} />
        ))}
      </div>
    </section>
  )
}
