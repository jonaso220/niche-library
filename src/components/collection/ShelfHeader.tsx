import type { ShelfDefinition } from '@/types/shelves'
import { TIME_FILTERS, OCCASION_FILTERS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  SunMedium, Moon, Clock,
  Briefcase, Shirt, PartyPopper, HeartHandshake, Sparkles,
} from 'lucide-react'

const FILTER_ICON_MAP: Record<string, React.ElementType> = {
  SunMedium, Moon, Clock,
  Briefcase, Shirt, PartyPopper, HeartHandshake, Sparkles,
}

interface ShelfHeaderProps {
  shelf: ShelfDefinition
  count: number
  isSeasonShelf?: boolean
  activeTimeFilter: string | null
  activeOccasionFilter: string | null
  onTimeFilterChange: (id: string | null) => void
  onOccasionFilterChange: (id: string | null) => void
}

export function ShelfHeader({
  shelf,
  count,
  isSeasonShelf,
  activeTimeFilter,
  activeOccasionFilter,
  onTimeFilterChange,
  onOccasionFilterChange,
}: ShelfHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
        {shelf.label}
      </h1>
      <p className="text-sm text-text-secondary mt-1">
        {shelf.description} — <span className="text-gold font-medium">{count} perfume{count !== 1 ? 's' : ''}</span>
      </p>

      {isSeasonShelf && (
        <div className="mt-4 space-y-2.5">
          {/* Horario chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted/60 self-center mr-1">Horario</span>
            {TIME_FILTERS.map(f => {
              const Icon = FILTER_ICON_MAP[f.icon]
              const active = activeTimeFilter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onTimeFilterChange(active ? null : f.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200',
                    active
                      ? 'bg-gold/20 text-gold border-gold/40 shadow-sm shadow-gold/10'
                      : 'bg-white/[0.04] text-text-secondary border-white/[0.08] hover:bg-white/[0.07] hover:text-text-primary hover:border-white/[0.12]'
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Ocasión chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted/60 self-center mr-1">Ocasión</span>
            {OCCASION_FILTERS.map(f => {
              const Icon = FILTER_ICON_MAP[f.icon]
              const active = activeOccasionFilter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onOccasionFilterChange(active ? null : f.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200',
                    active
                      ? 'bg-gold/20 text-gold border-gold/40 shadow-sm shadow-gold/10'
                      : 'bg-white/[0.04] text-text-secondary border-white/[0.08] hover:bg-white/[0.07] hover:text-text-primary hover:border-white/[0.12]'
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
