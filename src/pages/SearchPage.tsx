import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Search, Loader2, Wifi, WifiOff } from 'lucide-react'
import { useSearchPerfumes, addToCollection, addPerfumeToCatalog } from '@/db/hooks'
import { searchFragrances, isApiConfigured } from '@/api/fragella'
import type { Perfume } from '@/types/perfume'
import { PerfumeCard } from '@/components/perfume/PerfumeCard'
import { RatingStars } from '@/components/perfume/RatingStars'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [apiResults, setApiResults] = useState<Perfume[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const localResults = useSearchPerfumes(query)

  useEffect(() => {
    if (query.length < 3 || !isApiConfigured()) return

    const timeout = setTimeout(async () => {
      setApiLoading(true)
      setApiError(null)
      try {
        const results = await searchFragrances(query)
        const localIds = new Set(localResults?.map(p => p.id) ?? [])
        setApiResults(results.filter(r => !localIds.has(r.id)))
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Error al buscar')
        setApiResults([])
      } finally {
        setApiLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [query, localResults])

  function handleQueryChange(value: string) {
    setQuery(value)
    if (value.trim()) {
      setSearchParams({ q: value }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  async function handleAddFromApi(perfume: Perfume, owned: boolean) {
    await addPerfumeToCatalog(perfume)
    await addToCollection(perfume.id, owned)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Buscar Perfumes
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Busca en el catálogo local{isApiConfigured() ? ' y en Fragella API' : ''}
        </p>
      </div>

      {/* Search input */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Escribe nombre o marca... (ej: Sauvage, Lattafa, Khamrah)"
          className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 text-[15px]"
          autoFocus
        />
      </div>

      {/* Local results */}
      {localResults && localResults.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            En el Catálogo ({localResults.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {localResults.map(perfume => (
              <PerfumeCard key={perfume.id} perfume={perfume} showSeasons={false} />
            ))}
          </div>
        </section>
      )}

      {/* API results */}
      {isApiConfigured() && query.length >= 3 && (
        <section>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            {apiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wifi className="w-3.5 h-3.5" />
            )}
            Resultados Online
            {apiResults.length > 0 && ` (${apiResults.length})`}
          </h2>

          {apiError && (
            <div className="p-3 bg-danger/10 border border-danger/15 rounded-xl text-sm text-danger mb-3">
              {apiError}
            </div>
          )}

          {apiResults.length > 0 && (
            <div className="space-y-2">
              {apiResults.map(perfume => (
                <ApiResultCard
                  key={perfume.id}
                  perfume={perfume}
                  onAdd={handleAddFromApi}
                />
              ))}
            </div>
          )}

          {!apiLoading && !apiError && apiResults.length === 0 && query.length >= 3 && (
            <p className="text-sm text-text-muted">No se encontraron resultados online.</p>
          )}
        </section>
      )}

      {!isApiConfigured() && (
        <div className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl flex items-start gap-3 max-w-2xl">
          <WifiOff className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-text-secondary font-medium">Búsqueda online desactivada</p>
            <p className="text-xs text-text-muted mt-0.5">
              Configura tu API key de Fragella en Ajustes para buscar más allá del catálogo local.
            </p>
          </div>
        </div>
      )}

      {/* No results */}
      {query.length >= 2 && localResults?.length === 0 && !apiLoading && apiResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">
            No se encontró "{query}". <a href="/add" className="text-gold hover:text-gold-bright font-medium">Agregar manualmente</a>.
          </p>
        </div>
      )}
    </div>
  )
}

function ApiResultCard({ perfume, onAdd }: {
  perfume: Perfume
  onAdd: (perfume: Perfume, owned: boolean) => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleAdd(owned: boolean) {
    setAdding(true)
    await onAdd(perfume, owned)
    setAdded(true)
    setAdding(false)
  }

  return (
    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 hover:border-gold/15 transition-colors">
      <div className="w-14 h-14 bg-white/[0.03] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
        {perfume.imageUrl ? (
          <img src={perfume.imageUrl} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <span className="text-xl text-text-muted/30">💧</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gold-dim font-semibold">{perfume.brand}</p>
        <p className="text-sm font-medium text-text-primary truncate">{perfume.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <RatingStars rating={perfume.rating} size="sm" />
          <span className="text-[10px] text-text-muted">{perfume.concentration}</span>
        </div>
      </div>

      {added ? (
        <span className="text-xs text-accent-green font-medium px-3 py-1">Agregado</span>
      ) : (
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => handleAdd(true)}
            disabled={adding}
            className="px-3 py-1.5 bg-gold text-background rounded-lg text-xs font-semibold hover:bg-gold-bright disabled:opacity-50"
          >
            {adding ? '...' : 'Colección'}
          </button>
          <button
            onClick={() => handleAdd(false)}
            disabled={adding}
            className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-text-secondary hover:text-gold hover:border-gold/15 disabled:opacity-50"
          >
            Deseos
          </button>
        </div>
      )}
    </div>
  )
}
