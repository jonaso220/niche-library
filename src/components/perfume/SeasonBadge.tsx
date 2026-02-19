import { cn } from '@/lib/utils'
import type { SeasonScore } from '@/types/perfume'
import { SEASON_LABELS } from '@/lib/utils'

const SEASON_COLORS: Record<string, string> = {
  spring: 'bg-season-spring/20 text-season-spring border-season-spring/30',
  summer: 'bg-season-summer/20 text-season-summer border-season-summer/30',
  fall: 'bg-season-fall/20 text-season-fall border-season-fall/30',
  winter: 'bg-season-winter/20 text-season-winter border-season-winter/30',
}

const SEASON_ICONS: Record<string, string> = {
  spring: '🌸',
  summer: '☀️',
  fall: '🍂',
  winter: '❄️',
}

interface SeasonBadgeProps {
  seasonScores: SeasonScore[]
  threshold?: number
  compact?: boolean
}

export function SeasonBadge({ seasonScores, threshold = 50, compact = false }: SeasonBadgeProps) {
  const activeSeasons = seasonScores.filter(s => s.score >= threshold)

  if (activeSeasons.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {activeSeasons.map(({ season }) => (
        <span
          key={season}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border',
            compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
            SEASON_COLORS[season]
          )}
        >
          <span>{SEASON_ICONS[season]}</span>
          {!compact && <span>{SEASON_LABELS[season]}</span>}
        </span>
      ))}
    </div>
  )
}
