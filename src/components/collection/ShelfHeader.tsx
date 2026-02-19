import type { ShelfDefinition } from '@/types/shelves'

interface ShelfHeaderProps {
  shelf: ShelfDefinition
  count: number
}

export function ShelfHeader({ shelf, count }: ShelfHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
        {shelf.label}
      </h1>
      <p className="text-sm text-text-secondary mt-1">
        {shelf.description} — <span className="text-gold font-medium">{count} perfume{count !== 1 ? 's' : ''}</span>
      </p>
    </div>
  )
}
