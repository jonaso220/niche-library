import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Database,
  Heart,
  Library,
  Search,
  Shuffle,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useAllPerfumes, useCollectionPerfumes, useCollectionStats } from '@/db/hooks'
import { buildHomeDiscovery, SEASON_LABELS } from '@/lib/home-discovery'
import type { Perfume, ShelfPerfume } from '@/types/perfume'
import { PerfumeCard } from '@/components/perfume/PerfumeCard'
import { RatingStars } from '@/components/perfume/RatingStars'

const ACCORD_TONES: Record<string, string> = {
  fresh: 'fresco',
  citrus: 'cítrico',
  aquatic: 'acuático',
  aromatic: 'aromático',
  woody: 'amaderado',
  'warm spicy': 'especiado cálido',
  spicy: 'especiado',
  amber: 'ambarado',
  sweet: 'dulce',
  vanilla: 'avainillado',
  floral: 'floral',
  fruity: 'frutal',
  oud: 'de oud',
  tobacco: 'tabaquero',
  musky: 'almizclado',
  green: 'verde',
  powdery: 'empolvado',
  oriental: 'oriental',
  smoky: 'ahumado',
  gourmand: 'gourmand',
}

export function CollectionOverview() {
  const stats = useCollectionStats()
  const catalog = useAllPerfumes()
  const collection = useCollectionPerfumes()
  const [today] = useState(() => new Date())
  const [rotation, setRotation] = useState(0)

  const discovery = useMemo(
    () => buildHomeDiscovery(catalog ?? [], collection ?? [], today, rotation),
    [catalog, collection, rotation, today],
  )

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gold-dim text-xs font-bold uppercase tracking-[0.15em] mb-1.5">Bienvenido</p>
        <h1 className="page-title text-4xl md:text-5xl text-text-primary">
          Tu Colección
        </h1>
        <p className="text-sm text-text-secondary mt-1.5">
          Nuevos hallazgos y favoritos para redescubrir cada día.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard
          icon={<Library className="w-4.5 h-4.5" aria-hidden="true" />}
          color="gold"
          label="En Colección"
          value={stats?.totalInCollection ?? 0}
        />
        <StatCard
          icon={<Heart className="w-4.5 h-4.5" aria-hidden="true" />}
          color="rose"
          label="Lista de Deseos"
          value={stats?.totalWishlist ?? 0}
        />
        <StatCard
          icon={<TrendingUp className="w-4.5 h-4.5" aria-hidden="true" />}
          color="green"
          label="Rating Promedio"
          value={stats?.avgRating ?? 0}
          decimal
        />
        <StatCard
          icon={<Database className="w-4.5 h-4.5" aria-hidden="true" />}
          color="blue"
          label="En Catálogo"
          value={stats?.totalCatalog ?? 0}
        />
      </div>

      {discovery.featured && (
        <DailyFeature
          perfume={discovery.featured}
          seasonLabel={SEASON_LABELS[discovery.season]}
          onShuffle={() => setRotation(current => current + 1)}
        />
      )}

      {stats?.totalInCollection === 0 && (
        <EmptyCollection catalogCount={stats.totalCatalog} />
      )}

      {discovery.discover.length > 0 && (
        <ShelfPreview
          title="Descubre algo nuevo"
          description="Una selección distinta del catálogo, sin repetir lo que ya guardaste."
          items={discovery.discover}
          to="/search"
          linkLabel="Explorar catálogo"
        />
      )}

      {discovery.rediscover.length > 0 && (
        <ShelfPreview
          title="Redescubre tu colección"
          description="Perfumes tuyos que quizá hace tiempo no mirabas."
          items={discovery.rediscover}
          to="/shelf/all"
          linkLabel="Ver colección"
        />
      )}

      {discovery.wishlist.length > 0 && (
        <ShelfPreview
          title="En tu radar"
          description="Una mirada renovada a tu lista de deseos."
          items={discovery.wishlist}
          to="/shelf/wishlist"
          linkLabel="Ver deseos"
        />
      )}
    </div>
  )
}

function DailyFeature({ perfume, seasonLabel, onShuffle }: {
  perfume: Perfume
  seasonLabel: string
  onShuffle: () => void
}) {
  const dominantAccord = [...perfume.accords]
    .sort((left, right) => right.percentage - left.percentage)[0]?.name
  const accordTone = dominantAccord
    ? ACCORD_TONES[dominantAccord.toLowerCase()] ?? dominantAccord.toLowerCase()
    : undefined

  return (
    <section
      aria-live="polite"
      className="relative overflow-hidden rounded-3xl border border-gold/15 bg-card min-h-[300px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.09] via-transparent to-accent-emerald/[0.05] pointer-events-none" />
      <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-gold/[0.07] blur-[90px] pointer-events-none" />

      <div className="relative grid md:grid-cols-[1.25fr_0.75fr] min-h-[300px]">
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-gold-dim font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Selección de hoy · {seasonLabel}
          </div>
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted font-bold mb-1.5">
            {perfume.brand}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] text-text-primary leading-[1.02]">
            {perfume.name}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mt-4 max-w-lg">
            {accordTone
              ? `Un perfil ${accordTone} que encaja especialmente bien con el ${seasonLabel}.`
              : `Una fragancia elegida para acompañar especialmente bien el ${seasonLabel}.`}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <RatingStars rating={perfume.rating} />
            <span className="w-px h-4 bg-white/10" aria-hidden="true" />
            <span className="text-xs text-text-muted font-medium">{perfume.concentration}</span>
            {perfume.year && (
              <>
                <span className="w-px h-4 bg-white/10" aria-hidden="true" />
                <span className="text-xs text-text-muted font-medium">{perfume.year}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 mt-7">
            <Link
              to={`/perfume/${perfume.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-background rounded-xl text-sm font-bold hover:bg-gold-bright shadow-lg shadow-gold/15 transition-all"
            >
              Ver perfume
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={onShuffle}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary transition-all"
            >
              <Shuffle className="w-4 h-4" aria-hidden="true" />
              Cambiar selección
            </button>
          </div>
        </div>

        <div className="relative min-h-[260px] md:min-h-full flex items-center justify-center overflow-hidden border-t md:border-t-0 md:border-l border-white/[0.05]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(193,158,87,0.12),_transparent_66%)]" />
          {perfume.imageUrl ? (
            <img
              src={perfume.imageUrl}
              alt={`${perfume.brand} ${perfume.name}`}
              className="relative w-full h-[260px] md:h-[300px] object-contain p-7 md:p-8 drop-shadow-[0_24px_35px_rgba(0,0,0,0.45)]"
              loading="eager"
            />
          ) : (
            <div className="relative text-7xl font-bold text-gold/10" aria-hidden="true">
              {perfume.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </section>
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
  const colors = COLOR_MAP[color]
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colors.gradient} border ${colors.border} rounded-2xl px-3 py-2.5 hover:shadow-lg ${colors.glow} transition-all duration-200 card-lift flex items-center gap-2.5`}>
      <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center shrink-0`}>
        <span className={colors.text}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold tracking-tight text-text-primary leading-none">
          {decimal ? value.toFixed(1) : value}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5 font-semibold tracking-wide truncate">{label}</p>
      </div>
    </div>
  )
}

function ShelfPreview({ title, description, items, to, linkLabel }: {
  title: string
  description: string
  items: Array<Perfume | ShelfPerfume>
  to: string
  linkLabel: string
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-text-primary">{title}</h2>
          <p className="text-xs text-text-muted mt-1">{description}</p>
        </div>
        <Link
          to={to}
          className="hidden sm:flex items-center gap-1 text-xs text-text-muted hover:text-gold font-medium transition-colors shrink-0"
        >
          {linkLabel}
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 auto-rows-[0] overflow-hidden grid-rows-1">
        {items.map(perfume => (
          <PerfumeCard key={perfume.id} perfume={perfume} showSeasons={false} />
        ))}
      </div>
    </section>
  )
}

function EmptyCollection({ catalogCount }: { catalogCount: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/10 p-8 md:p-10">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.06] via-accent-emerald/[0.03] to-accent-purple/[0.04] shimmer-bg" />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="text-xl font-bold tracking-tight gradient-text">Comienza tu colección</h2>
          <p className="text-text-secondary text-sm leading-relaxed mt-2">
            Hay <span className="text-gold font-bold">{catalogCount} perfumes</span> listos para explorar y guardar en tu biblioteca personal.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-background rounded-xl font-bold text-sm glow-gold hover:bg-gold-bright transition-all"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            Explorar catálogo
          </Link>
          <Link
            to="/add"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-white/[0.10] rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/[0.09] transition-all"
          >
            Agregar manual
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
