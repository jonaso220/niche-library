import { Link } from 'react-router'
import type { ShelfPerfume, Perfume } from '@/types/perfume'
import { RatingStars } from './RatingStars'
import { SeasonBadge } from './SeasonBadge'
import { PriceTag } from './PriceTag'
import { Droplets } from 'lucide-react'

interface PerfumeCardProps {
  perfume: ShelfPerfume | Perfume
  showPrice?: boolean
  showSeasons?: boolean
  onClick?: () => void
}

function isShelfPerfume(p: ShelfPerfume | Perfume): p is ShelfPerfume {
  return 'effectiveRating' in p
}

export function PerfumeCard({ perfume, showPrice = true, showSeasons = true, onClick }: PerfumeCardProps) {
  const rating = isShelfPerfume(perfume) ? perfume.effectiveRating : perfume.rating

  const content = (
    <div className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-gold/15 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 hover:-translate-y-0.5">
      {/* Image */}
      <div className="aspect-square bg-white/[0.02] flex items-center justify-center overflow-hidden relative">
        {perfume.imageUrl ? (
          <img
            src={perfume.imageUrl}
            alt={`${perfume.brand} ${perfume.name}`}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-muted/50">
            <Droplets className="w-10 h-10" />
            <span className="text-[10px] font-medium">{perfume.concentration}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-gold-dim font-semibold truncate">
            {perfume.brand}
          </p>
          <h3 className="font-semibold text-sm leading-snug truncate text-text-primary group-hover:text-gold transition-colors">
            {perfume.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <RatingStars rating={rating} />
          <span className="text-[10px] text-text-muted font-medium">{perfume.concentration}</span>
        </div>

        {showSeasons && perfume.seasonScores.length > 0 && (
          <SeasonBadge seasonScores={perfume.seasonScores} compact />
        )}

        {showPrice && (
          <PriceTag
            brand={perfume.brand}
            priceEstimate={isShelfPerfume(perfume) ? perfume.collectionData.priceEstimate : undefined}
            compact
          />
        )}

        {/* Performance */}
        <div className="flex items-center gap-3 text-[10px] text-text-muted font-medium">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green/60" />
            {perfume.longevity}/10
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue/60" />
            {perfume.sillage}/10
          </span>
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return (
    <Link to={`/perfume/${perfume.id}`}>
      {content}
    </Link>
  )
}
