import { useParams } from 'react-router'
import { useShelfPerfumes } from '@/db/hooks'
import { getShelfDefinition } from '@/lib/constants'
import { ShelfHeader } from '@/components/collection/ShelfHeader'
import { ShelfView } from '@/components/collection/ShelfView'
import { EmptyShelf } from '@/components/collection/EmptyShelf'
import type { ShelfType } from '@/types/shelves'

export function ShelfPage() {
  const { shelfId } = useParams<{ shelfId: string }>()
  const shelf = getShelfDefinition(shelfId ?? '')
  const perfumes = useShelfPerfumes((shelfId ?? 'all') as ShelfType)

  if (!shelf) {
    return (
      <div className="text-center py-16">
        <h1 className="font-heading text-2xl text-text-secondary">Estantería no encontrada</h1>
      </div>
    )
  }

  if (!perfumes) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Cargando...</p>
      </div>
    )
  }

  return (
    <div>
      <ShelfHeader shelf={shelf} count={perfumes.length} />
      {perfumes.length === 0 ? (
        <EmptyShelf message={`No hay perfumes en ${shelf.label}`} />
      ) : (
        <ShelfView perfumes={perfumes} />
      )}
    </div>
  )
}
