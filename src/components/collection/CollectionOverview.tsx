import { Link } from 'react-router'
import { useCollectionStats, useCollectionPerfumes } from '@/db/hooks'
import { SHELF_DEFINITIONS } from '@/lib/constants'
import { Library, Heart, TrendingUp, Database, ChevronRight } from 'lucide-react'
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

  // Quick shelf previews
  const shelfPreviews = ['season-spring', 'season-summer', 'season-fall', 'season-winter'].map(id => {
    const shelf = SHELF_DEFINITIONS.find(s => s.id === id)!
    const items = allPerfumes?.filter(shelf.filterFn).sort((a, b) => b.effectiveRating - a.effectiveRating).slice(0, 5) ?? []
    return { shelf, items }
  })

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
          Tu Colección
        </h1>
        <p className="text-text-secondary mt-1">Bienvenido a tu biblioteca de fragancias</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Library className="w-5 h-5 text-gold" />}
          label="En Colección"
          value={stats?.totalInCollection ?? 0}
        />
        <StatCard
          icon={<Heart className="w-5 h-5 text-accent-rose" />}
          label="Lista de Deseos"
          value={stats?.totalWishlist ?? 0}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-accent-green" />}
          label="Rating Promedio"
          value={stats?.avgRating ?? 0}
          decimal
        />
        <StatCard
          icon={<Database className="w-5 h-5 text-accent-blue" />}
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
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">🧴</span>
          <h2 className="font-heading text-2xl text-text-secondary mb-2">
            Tu colección está vacía
          </h2>
          <p className="text-text-muted mb-6 max-w-md mx-auto">
            Comienza buscando perfumes en el catálogo y agrégalos a tu colección.
            Tenemos más de {stats?.totalCatalog ?? 0} perfumes pre-cargados.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-background rounded-lg font-medium hover:bg-gold-bright transition-colors"
          >
            Explorar Catálogo
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, decimal }: {
  icon: React.ReactNode
  label: string
  value: number
  decimal?: boolean
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="font-heading text-2xl font-bold text-text-primary">
        {decimal ? value.toFixed(1) : value}
      </p>
      <p className="text-xs text-text-muted">{label}</p>
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
        <h2 className="font-heading text-xl font-semibold text-text-primary">{title}</h2>
        <Link
          to={to}
          className="flex items-center gap-1 text-sm text-gold hover:text-gold-bright transition-colors"
        >
          Ver todo
          <ChevronRight className="w-4 h-4" />
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
