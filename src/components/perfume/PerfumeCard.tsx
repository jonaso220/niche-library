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
    <div className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.10] rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/20">
      {/* Image */}
      <div className="aspect-square bg-white/[0.02] flex items-center justify-center overflow-hidden">
        {perfume.imageUrl ? (
          <img
            src={perfume.imageUrl}
            alt={`${perfume.brand} ${perfume.name}`}
            className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-text-muted/30">
            <Droplets className="w-8 h-8" />
            <span className="text-[10px] font-medium text-text-muted/40">{perfume.concentration}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-gold-dim font-semibold truncate">
            {perfume.brand}
          </p>
          <h3 className="font-semibold text-[13px] leading-snug truncate text-text-primary group-hover:text-gold transition-colors">
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

        {/* Performance dots */}
        <div className="flex items-center gap-3 text-[10px] text-text-muted">
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-accent-green/50" />
            {perfume.longevity}/10
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-accent-blue/50" />
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
