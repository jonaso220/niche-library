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
    <header className="mb-8 md:mb-10">
      <h1 className="page-title text-4xl md:text-5xl text-text-primary">
        {shelf.label}
      </h1>
      <p className="text-sm md:text-base text-text-secondary mt-3 flex flex-wrap items-center gap-2">
        <span>{shelf.description}</span>
        <span className="text-text-muted/50" aria-hidden="true">•</span>
        <span className="text-gold font-semibold">{count} perfume{count !== 1 ? 's' : ''}</span>
      </p>

      <div className="gold-rail mt-6" aria-hidden="true" />

      {isSeasonShelf && (
        <div className="surface-panel mt-6 rounded-2xl p-4 md:p-5 space-y-3">
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
                  aria-pressed={active}
                  onClick={() => onTimeFilterChange(active ? null : f.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200',
                    active
                      ? 'bg-gold/20 text-gold border-gold/40 shadow-sm shadow-gold/10'
                      : 'bg-white/[0.04] text-text-secondary border-white/[0.08] hover:bg-white/[0.07] hover:text-text-primary hover:border-white/[0.12]'
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
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
                  aria-pressed={active}
                  onClick={() => onOccasionFilterChange(active ? null : f.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200',
                    active
                      ? 'bg-gold/20 text-gold border-gold/40 shadow-sm shadow-gold/10'
                      : 'bg-white/[0.04] text-text-secondary border-white/[0.08] hover:bg-white/[0.07] hover:text-text-primary hover:border-white/[0.12]'
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
