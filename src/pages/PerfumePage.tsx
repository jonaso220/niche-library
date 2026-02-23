import { useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import { transformToLocal } from '@/api/parfumo-provider'
import { PerfumeDetail } from '@/components/perfume/PerfumeDetail'
import type { Perfume } from '@/types/perfume'

function usePerfumeByIdWithFallback(id: string): Perfume | null | undefined {
  return useLiveQuery(async () => {
    // First try local catalog
    const local = await db.perfumes.get(id)
    if (local) return local

    // Fallback: look in Parfumo dataset and transform
    const parfumoEntry = await db.parfumo.get(id)
    if (parfumoEntry) return transformToLocal(parfumoEntry)

    return null
  }, [id])
}

export function PerfumePage() {
  const { perfumeId } = useParams<{ perfumeId: string }>()
  const perfume = usePerfumeByIdWithFallback(perfumeId ?? '')

  if (perfume === undefined) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Cargando perfume...</p>
      </div>
    )
  }

  if (!perfume) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">😔</span>
        <h1 className="font-heading text-2xl text-text-secondary">Perfume no encontrado</h1>
      </div>
    )
  }

  return <PerfumeDetail perfume={perfume} />
}
