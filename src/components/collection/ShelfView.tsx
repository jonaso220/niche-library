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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
      {perfumes.map(perfume => (
        <PerfumeCard key={perfume.id} perfume={perfume} />
      ))}
    </div>
  )
}
