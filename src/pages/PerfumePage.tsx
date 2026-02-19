import { useParams } from 'react-router'
import { usePerfumeById } from '@/db/hooks'
import { PerfumeDetail } from '@/components/perfume/PerfumeDetail'

export function PerfumePage() {
  const { perfumeId } = useParams<{ perfumeId: string }>()
  const perfume = usePerfumeById(perfumeId ?? '')

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
