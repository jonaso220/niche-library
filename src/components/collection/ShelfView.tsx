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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 md:gap-3">
      {perfumes.map(perfume => (
        <PerfumeCard key={perfume.id} perfume={perfume} />
      ))}
    </div>
  )
}
