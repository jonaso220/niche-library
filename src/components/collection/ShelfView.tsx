import type { ShelfPerfume } from '@/types/perfume'
import { PerfumeCard } from '@/components/perfume/PerfumeCard'
import { EmptyShelf } from './EmptyShelf'

interface ShelfViewProps {
  perfumes: ShelfPerfume[]
}

export function ShelfView({ perfumes }: ShelfViewProps) {
  if (perfumes.length === 0) {
    return <EmptyShelf />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))] gap-3.5 md:gap-4">
      {perfumes.map(perfume => (
        <PerfumeCard key={perfume.id} perfume={perfume} />
      ))}
    </div>
  )
}
