import { Link, useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Search, PlusCircle, SearchX } from 'lucide-react'
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

function PerfumeSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando perfume</span>
      <div className="h-5 w-20 rounded bg-white/[0.04] animate-pulse" />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 shrink-0 aspect-square rounded-xl border border-border/40 bg-white/[0.03] animate-pulse" />
        <div className="flex-1 space-y-4">
          <div className="h-3 w-16 rounded bg-white/[0.05] animate-pulse" />
          <div className="h-8 w-2/3 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-40 rounded bg-white/[0.04] animate-pulse" />
          <div className="h-5 w-24 rounded bg-white/[0.05] animate-pulse" />
          <div className="h-10 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-40 rounded-xl border border-border/40 bg-white/[0.03] animate-pulse" />
        <div className="h-40 rounded-xl border border-border/40 bg-white/[0.03] animate-pulse" />
      </div>
    </div>
  )
}

function PerfumeNotFound({ perfumeId }: { perfumeId: string }) {
  const navigate = useNavigate()
  return (
    <div className="max-w-lg mx-auto py-16 text-center space-y-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-gold transition-colors mx-auto"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver
      </button>

      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto">
        <SearchX className="w-7 h-7 text-text-muted" aria-hidden="true" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-text-primary">Perfume no encontrado</h1>
        <p className="text-sm text-text-muted leading-relaxed">
          No encontramos <span className="text-text-secondary font-mono text-xs">{perfumeId}</span> ni en tu
          catálogo local ni en el dataset global.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
        <Link
          to="/search"
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gold text-background rounded-lg text-sm font-semibold hover:bg-gold-bright transition-colors"
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          Buscar en el catálogo
        </Link>
        <Link
          to="/add"
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
          Agregar manualmente
        </Link>
      </div>
    </div>
  )
}

export function PerfumePage() {
  const { perfumeId } = useParams<{ perfumeId: string }>()
  const perfume = usePerfumeByIdWithFallback(perfumeId ?? '')

  if (perfume === undefined) return <PerfumeSkeleton />
  if (!perfume) return <PerfumeNotFound perfumeId={perfumeId ?? ''} />

  return <PerfumeDetail perfume={perfume} />
}
