import { useState, useMemo } from 'react'
import { useParams } from 'react-router'
import { useShelfPerfumes } from '@/db/hooks'
import { getShelfDefinition } from '@/lib/constants'
import { ShelfHeader } from '@/components/collection/ShelfHeader'
import { ShelfView } from '@/components/collection/ShelfView'
import { EmptyShelf } from '@/components/collection/EmptyShelf'
import type { ShelfType } from '@/types/shelves'
import type { ShelfPerfume } from '@/types/perfume'

const TIME_HIGH = 60
const TIME_LOW = 40
const OCCASION_THRESHOLD = 50

function applyTimeFilter(items: ShelfPerfume[], filter: string): ShelfPerfume[] {
  return items.filter(p => {
    const casual = p.occasionScores.find(o => o.occasion === 'casual')?.score ?? 0
    const prof = p.occasionScores.find(o => o.occasion === 'professional')?.score ?? 0
    const night = p.occasionScores.find(o => o.occasion === 'nightOut')?.score ?? 0
    const dayScore = (casual + prof) / 2
    if (filter === 'day') return dayScore >= TIME_HIGH || (dayScore >= TIME_LOW && night < TIME_HIGH)
    if (filter === 'night') return night >= TIME_LOW
    if (filter === 'versatile') return dayScore >= TIME_LOW && night >= TIME_LOW
    return true
  })
}

function applyOccasionFilter(items: ShelfPerfume[], occasion: string): ShelfPerfume[] {
  return items.filter(p =>
    (p.occasionScores.find(o => o.occasion === occasion)?.score ?? 0) >= OCCASION_THRESHOLD
  )
}

export function ShelfPage() {
  const { shelfId } = useParams<{ shelfId: string }>()
  const shelf = getShelfDefinition(shelfId ?? '')
  const perfumes = useShelfPerfumes((shelfId ?? 'all') as ShelfType)

  const isSeasonShelf = shelfId?.startsWith('season-') ?? false

  const [activeTimeFilter, setActiveTimeFilter] = useState<string | null>(null)
  const [activeOccasionFilter, setActiveOccasionFilter] = useState<string | null>(null)

  const filteredPerfumes = useMemo(() => {
    if (!perfumes || !isSeasonShelf) return perfumes
    let result = perfumes
    if (activeTimeFilter) result = applyTimeFilter(result, activeTimeFilter)
    if (activeOccasionFilter) result = applyOccasionFilter(result, activeOccasionFilter)
    return result
  }, [perfumes, activeTimeFilter, activeOccasionFilter, isSeasonShelf])

  if (!shelf) {
    return (
      <div className="text-center py-16">
        <h1 className="font-heading text-2xl text-text-secondary">Estantería no encontrada</h1>
      </div>
    )
  }

  if (!filteredPerfumes) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Cargando...</p>
      </div>
    )
  }

  return (
    <div>
      <ShelfHeader
        shelf={shelf}
        count={filteredPerfumes.length}
        isSeasonShelf={isSeasonShelf}
        activeTimeFilter={activeTimeFilter}
        activeOccasionFilter={activeOccasionFilter}
        onTimeFilterChange={setActiveTimeFilter}
        onOccasionFilterChange={setActiveOccasionFilter}
      />
      {filteredPerfumes.length === 0 ? (
        <EmptyShelf message={`No hay perfumes en ${shelf.label}${activeTimeFilter || activeOccasionFilter ? ' con estos filtros' : ''}`} />
      ) : (
        <ShelfView perfumes={filteredPerfumes} />
      )}
    </div>
  )
}
