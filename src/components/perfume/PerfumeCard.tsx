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
    <article className="group relative bg-[linear-gradient(155deg,rgba(15,34,28,0.96),rgba(8,21,17,0.98))] border border-white/[0.075] hover:border-gold/30 rounded-[1.15rem] overflow-hidden card-lift flex flex-col h-full shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      {/* Subtle gold glow on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent opacity-25 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

      {/* Image */}
      <div className="relative m-2.5 mb-0 aspect-[4/3] rounded-[0.9rem] border border-gold/[0.13] flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_rgba(180,170,155,0.13)_0%,_rgba(15,41,32,0.2)_42%,_transparent_74%)]">
        {perfume.imageUrl ? (
          <img
            src={perfume.imageUrl}
            alt={`${perfume.brand} ${perfume.name}`}
            className="w-full h-full object-contain p-3 brightness-[0.9] contrast-[1.04] drop-shadow-[0_14px_16px_rgba(0,0,0,0.32)] group-hover:brightness-100 group-hover:scale-[1.045] transition-all duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-muted/20">
            <Droplets className="w-8 h-8" aria-hidden="true" />
            <span className="text-[10px] font-medium text-text-muted/30">{perfume.concentration}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative p-4 flex flex-col flex-1">
        <div className="space-y-2.5 flex-1">
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-gold-dim font-bold truncate">
              {perfume.brand}
            </p>
            <h3 className="font-display font-semibold text-lg leading-tight truncate text-text-primary group-hover:text-gold transition-colors duration-200">
              {perfume.name}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.065]">
            <RatingStars rating={rating} />
          </div>

          {showSeasons && perfume.seasonScores.length > 0 && (
            <SeasonBadge seasonScores={perfume.seasonScores} compact />
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold uppercase tracking-[0.08em]">
            <Droplets className="w-3.5 h-3.5 text-gold-dim/70" aria-hidden="true" />
            <span>{perfume.concentration}</span>
          </div>

          {showPrice && (
            <PriceTag
              brand={perfume.brand}
              priceEstimate={isShelfPerfume(perfume) ? perfume.collectionData.priceEstimate : undefined}
              compact
            />
          )}
        </div>

        {/* Performance bars — always at bottom */}
        <div className="flex items-center justify-between gap-3 text-[10px] text-text-muted mt-3 pt-3 border-t border-white/[0.065]">
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
    </article>
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
