import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'sm',
  interactive = false,
  onChange,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5',
  }

  const star = (i: number) => {
    const filled = i < Math.floor(rating)
    const half = !filled && i < rating
    return (
      <Star
        aria-hidden="true"
        className={cn(
          sizeClasses[size],
          filled ? 'fill-gold text-gold' : half ? 'fill-gold/50 text-gold' : 'fill-transparent text-text-muted/40',
        )}
      />
    )
  }

  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'group' : 'img'} aria-label={`${rating.toFixed(1)} de ${maxRating} estrellas`}>
      {Array.from({ length: maxRating }, (_, i) => {
        return interactive ? (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i + 1)}
            aria-label={`${i + 1} de ${maxRating} estrellas`}
            aria-pressed={rating === i + 1}
            className="transition-colors cursor-pointer hover:scale-110"
          >
            {star(i)}
          </button>
        ) : (
          <span key={i}>{star(i)}</span>
        )
      })}
      <span className="ml-1 text-xs text-text-secondary">{rating.toFixed(1)}</span>
    </div>
  )
}
