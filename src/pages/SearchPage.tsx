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
    <div className="space-y-8">
      <div>
        <p className="text-gold-dim text-xs font-bold uppercase tracking-[0.15em] mb-1.5">Explorar</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Buscar Perfumes
        </h1>
        <p className="text-sm text-text-secondary mt-1.5">
          Busca en el catálogo local{isApiConfigured() ? ' y en Fragella API' : ''}
        </p>
      </div>

      {/* Search input */}
      <div className="relative max-w-2xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-gold transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Escribe nombre o marca... (ej: Sauvage, Lattafa, Khamrah)"
          className="w-full pl-12 pr-5 py-4 bg-card border border-border/50 rounded-2xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold/30 focus:ring-2 focus:ring-gold/15 focus:shadow-lg focus:shadow-gold/5 text-[15px] transition-all"
          autoFocus
        />
      </div>

      {/* Local results */}
      {localResults && localResults.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
            En el Catálogo
            <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full text-[10px] font-bold">{localResults.length}</span>
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
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
            {apiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-accent-green" />
            )}
            Resultados Online
            {apiResults.length > 0 && (
              <span className="px-2 py-0.5 bg-accent-green/10 text-accent-green rounded-full text-[10px] font-bold">{apiResults.length}</span>
            )}
          </h2>

          {apiError && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-sm text-danger mb-4">
              {apiError}
            </div>
          )}

          {apiResults.length > 0 && (
            <div className="space-y-2.5">
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
        <div className="p-5 bg-card border border-border/30 rounded-2xl flex items-start gap-3.5 max-w-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm text-text-primary font-semibold">Búsqueda online desactivada</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Configura tu API key de Fragella en Ajustes para buscar más allá del catálogo local.
            </p>
          </div>
        </div>
      )}

      {/* No results */}
      {query.length >= 2 && localResults?.length === 0 && !apiLoading && apiResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">
            No se encontró "{query}". <a href="/add" className="text-gold hover:text-gold-bright font-semibold underline underline-offset-2 decoration-gold/30 hover:decoration-gold/60 transition-colors">Agregar manualmente</a>.
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
    <div className="flex items-center gap-4 bg-card border border-border/30 rounded-2xl p-4 hover:border-gold/15 hover:shadow-lg hover:shadow-black/10 transition-all duration-200">
      <div className="w-16 h-16 bg-white/[0.03] rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-white/[0.04]">
        {perfume.imageUrl ? (
          <img src={perfume.imageUrl} alt="" className="w-full h-full object-contain p-1.5" />
        ) : (
          <span className="text-xl text-text-muted/20">💧</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.1em] text-gold-dim font-bold">{perfume.brand}</p>
        <p className="text-sm font-semibold text-text-primary truncate">{perfume.name}</p>
        <div className="flex items-center gap-2.5 mt-1">
          <RatingStars rating={perfume.rating} size="sm" />
          <span className="text-[10px] text-text-muted font-medium">{perfume.concentration}</span>
        </div>
      </div>

      {added ? (
        <span className="text-xs text-accent-green font-bold px-3 py-1.5 bg-accent-green/10 rounded-lg">✓ Agregado</span>
      ) : (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleAdd(true)}
            disabled={adding}
            className="px-4 py-2 bg-gradient-to-r from-gold to-gold-bright text-background rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-gold/15 disabled:opacity-50 transition-all"
          >
            {adding ? '...' : 'Colección'}
          </button>
          <button
            onClick={() => handleAdd(false)}
            disabled={adding}
            className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-xs font-medium text-text-secondary hover:text-gold hover:border-gold/20 hover:bg-gold/5 disabled:opacity-50 transition-all"
          >
            Deseos
          </button>
        </div>
      )}
    </div>
  )
}
