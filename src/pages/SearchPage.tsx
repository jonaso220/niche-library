import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Search, Loader2, Wifi, WifiOff, AlertTriangle, Database, Download } from 'lucide-react'
import { useSearchPerfumes, addToCollection, addPerfumeToCatalog } from '@/db/hooks'
import { searchAllApis, isAnyApiConfigured } from '@/api/search-orchestrator'
import { isParfumoLoaded, loadParfumoDataset } from '@/db/parfumo-loader'
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
  const [apiWarnings, setApiWarnings] = useState<string[]>([])
  const [datasetLoaded, setDatasetLoaded] = useState(isParfumoLoaded())
  const [datasetLoading, setDatasetLoading] = useState(false)

  const localResults = useSearchPerfumes(query)

  // Auto-load dataset on mount if not already loaded
  useEffect(() => {
    if (!isParfumoLoaded()) {
      setDatasetLoading(true)
      loadParfumoDataset()
        .then(() => {
          setDatasetLoaded(true)
          setDatasetLoading(false)
        })
        .catch(() => {
          setDatasetLoading(false)
        })
    }
  }, [])

  useEffect(() => {
    if (query.length < 3 || !isAnyApiConfigured()) return

    const timeout = setTimeout(async () => {
      setApiLoading(true)
      setApiError(null)
      setApiWarnings([])
      try {
        const { results, errors } = await searchAllApis(query)
        const localIds = new Set(localResults?.map(p => p.id) ?? [])
        setApiResults(results.filter(r => !localIds.has(r.id)))

        // If some providers failed but we still got results, show warnings
        if (errors.length > 0 && results.length > 0) {
          setApiWarnings(errors.map(e => `${e.provider}: ${e.error}`))
        }
        // If ALL providers failed, show as error
        if (errors.length > 0 && results.length === 0) {
          setApiError(errors.map(e => `${e.provider}: ${e.error}`).join(' | '))
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Error al buscar')
        setApiResults([])
      } finally {
        setApiLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [query, localResults, datasetLoaded])

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

  const hasAnyProvider = isAnyApiConfigured()

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gold-dim text-xs font-bold uppercase tracking-[0.15em] mb-1.5">Explorar</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Buscar Perfumes
        </h1>
        <p className="text-sm text-text-secondary mt-1.5">
          {datasetLoaded
            ? 'Busca entre 59.000+ fragancias del catálogo global'
            : datasetLoading
              ? 'Cargando base de datos de fragancias...'
              : 'Busca en el catálogo local'}
        </p>
      </div>

      {/* Dataset loading indicator */}
      {datasetLoading && (
        <div className="p-4 bg-gold/5 border border-gold/15 rounded-2xl flex items-center gap-3 max-w-3xl">
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
            <Download className="w-4.5 h-4.5 text-gold animate-bounce" />
          </div>
          <div>
            <p className="text-sm text-text-primary font-semibold">Descargando base de datos</p>
            <p className="text-xs text-text-muted mt-0.5">59.000+ fragancias (~2 MB). Solo se descarga una vez.</p>
          </div>
          <Loader2 className="w-4 h-4 text-gold animate-spin ml-auto" />
        </div>
      )}

      {/* Search input */}
      <div className="relative max-w-3xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-gold transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Escribe nombre o marca... (ej: Sauvage, Le Beau, Givenchy)"
          className="w-full pl-12 pr-5 py-4 bg-card border border-border/50 rounded-2xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold/30 focus:ring-2 focus:ring-gold/15 focus:shadow-lg focus:shadow-gold/5 text-[15px] transition-all"
          autoFocus
        />
      </div>

      {/* Local results */}
      {localResults && localResults.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
            En tu Catálogo
            <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full text-[10px] font-bold">{localResults.length}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3">
            {localResults.map(perfume => (
              <PerfumeCard key={perfume.id} perfume={perfume} showSeasons={false} />
            ))}
          </div>
        </section>
      )}

      {/* API + Dataset results */}
      {hasAnyProvider && query.length >= 3 && (
        <section>
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
            {apiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
            ) : datasetLoaded ? (
              <Database className="w-3.5 h-3.5 text-accent-green" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-accent-green" />
            )}
            Resultados Encontrados
            {apiResults.length > 0 && (
              <span className="px-2 py-0.5 bg-accent-green/10 text-accent-green rounded-full text-[10px] font-bold">{apiResults.length}</span>
            )}
          </h2>

          {/* Warnings (partial failures) */}
          {apiWarnings.length > 0 && (
            <div className="p-3 bg-warning/5 border border-warning/15 rounded-xl text-xs text-warning/80 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Algunos proveedores fallaron:</span>
                <ul className="mt-1 space-y-0.5">
                  {apiWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

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
            <p className="text-sm text-text-muted">No se encontraron resultados.</p>
          )}
        </section>
      )}

      {!hasAnyProvider && !datasetLoading && (
        <div className="p-5 bg-card border border-border/30 rounded-2xl flex items-start gap-3.5 max-w-3xl">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm text-text-primary font-semibold">Búsqueda extendida no disponible</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              La base de datos de fragancias se está cargando. También puedes configurar APIs en Ajustes para más resultados.
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
          {perfume.year && (
            <span className="text-[10px] text-text-muted/50">{perfume.year}</span>
          )}
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
