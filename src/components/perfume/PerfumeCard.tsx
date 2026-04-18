import { memo } from 'react'
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

function PerfumeCardImpl({ perfume, showPrice = true, showSeasons = true, onClick }: PerfumeCardProps) {
  const rating = isShelfPerfume(perfume) ? perfume.effectiveRating : perfume.rating

  const content = (
    <div className="group relative bg-card hover:bg-card-hover border border-border/40 hover:border-gold/20 rounded-2xl overflow-hidden card-lift flex flex-col h-full">
      {/* Subtle gold glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Image */}
      <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_rgba(180,170,155,0.12)_0%,_transparent_70%)]">
        {perfume.imageUrl ? (
          <img
            src={perfume.imageUrl}
            alt={`${perfume.brand} ${perfume.name}`}
            className="w-full h-full object-contain p-3 brightness-[0.88] contrast-[1.05] group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-muted/20">
            <Droplets className="w-8 h-8" />
            <span className="text-[10px] font-medium text-text-muted/30">{perfume.concentration}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative p-3.5 border-t border-white/[0.04] flex flex-col flex-1">
        <div className="space-y-2 flex-1">
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-gold-dim font-bold truncate">
              {perfume.brand}
            </p>
            <h3 className="font-semibold text-[13px] leading-snug truncate text-text-primary group-hover:text-gold transition-colors duration-200">
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
        </div>

        {/* Performance bars — always at bottom */}
        <div className="flex items-center gap-3 text-[10px] text-text-muted mt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green shadow-sm shadow-accent-green/30" />
            {perfume.longevity}/10
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-sm shadow-accent-blue/30" />
            {perfume.sillage}/10
          </span>
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full h-full text-left">
        {content}
      </button>
    )
  }

  return (
    <Link to={`/perfume/${perfume.id}`} className="h-full">
      {content}
    </Link>
  )
}

export const PerfumeCard = memo(PerfumeCardImpl)
