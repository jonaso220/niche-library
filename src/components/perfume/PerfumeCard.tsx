import { Link } from 'react-router'
import type { ShelfPerfume, Perfume } from '@/types/perfume'
import { RatingStars } from './RatingStars'
import { SeasonBadge } from './SeasonBadge'
import { PriceTag } from './PriceTag'

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
    <div className="group bg-card hover:bg-card-hover border border-border-subtle hover:border-gold/20 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-gold/5">
      {/* Image */}
      <div className="aspect-square bg-surface flex items-center justify-center overflow-hidden">
        {perfume.imageUrl ? (
          <img
            src={perfume.imageUrl}
            alt={`${perfume.brand} ${perfume.name}`}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <span className="text-4xl">🧴</span>
            <span className="text-xs">{perfume.concentration}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gold-dim font-medium truncate">
            {perfume.brand}
          </p>
          <h3 className="font-heading font-semibold text-sm leading-tight truncate text-text-primary group-hover:text-gold transition-colors">
            {perfume.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <RatingStars rating={rating} />
          <span className="text-[10px] text-text-muted">{perfume.concentration}</span>
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

        {/* Performance badges */}
        <div className="flex items-center gap-2 text-[10px] text-text-muted">
          <span>⏱ {perfume.longevity}/10</span>
          <span>💨 {perfume.sillage}/10</span>
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
