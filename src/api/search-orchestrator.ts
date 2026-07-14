import type { Perfume } from '@/types/perfume'
import type { ApiProvider, SearchResult } from '@/api/types'
import { generateSlug } from '@/lib/utils'
import { fragellaProvider } from '@/api/fragella'
import { fragranceFinderProvider } from '@/api/fragrancefinder'
import { parfumoProvider } from '@/api/parfumo-provider'

/**
 * Priority order: providers listed first win in merge conflicts.
 * Fragella provides the richest data (accords, seasons, occasions).
 * Parfumo is the local dataset (59K fragrances, no API key needed).
 */
const onlineProviders: ApiProvider[] = [
  fragellaProvider,
  fragranceFinderProvider,
]

/**
 * Data richness score — used to decide which duplicate to keep.
 * Higher = more complete data.
 * @internal exported for unit testing.
 */
export function richnessScore(p: Perfume): number {
  let score = 0
  if (p.rating > 0) score += 2
  if (p.longevity !== 5) score += 1 // non-default
  if (p.sillage !== 5) score += 1
  if (p.notes.top.length > 0) score += 2
  if (p.notes.middle.length > 0) score += 2
  if (p.notes.base.length > 0) score += 2
  if (p.accords.length > 0) score += 3
  if (p.seasonScores.length > 0 && p.seasonScores.some(s => s.score !== 5)) score += 2
  if (p.occasionScores.length > 0 && p.occasionScores.some(o => o.score !== 5)) score += 2
  if (p.imageUrl) score += 1
  if (p.year) score += 1
  if (p.description) score += 1
  return score
}

/**
 * Deduplicates and merges results from multiple API providers.
 * When duplicates are found (same slug), keeps the one with richer data.
 * @internal exported for unit testing.
 */
export function deduplicateAndMerge(allResults: Perfume[]): Perfume[] {
  const slugMap = new Map<string, Perfume>()

  for (const perfume of allResults) {
    const slug = generateSlug(perfume.brand, perfume.name, perfume.concentration)

    const existing = slugMap.get(slug)
    if (!existing) {
      slugMap.set(slug, perfume)
    } else {
      // Keep the one with more data
      if (richnessScore(perfume) > richnessScore(existing)) {
        // Merge: use richer result but preserve any unique fields from existing
        const merged = { ...perfume }
        if (!merged.imageUrl && existing.imageUrl) merged.imageUrl = existing.imageUrl
        if (!merged.description && existing.description) merged.description = existing.description
        if (!merged.year && existing.year) merged.year = existing.year
        slugMap.set(slug, merged)
      } else {
        // Keep existing but fill in any missing data from new result
        if (!existing.imageUrl && perfume.imageUrl) existing.imageUrl = perfume.imageUrl
        if (!existing.description && perfume.description) existing.description = perfume.description
        if (!existing.year && perfume.year) existing.year = perfume.year
      }
    }
  }

  return Array.from(slugMap.values())
}

/**
 * In-memory cache keyed by "normalizedQuery|limit|providerSet".
 * Dedupes identical in-flight requests and short-circuits repeats.
 * Bounded TTL prevents stale data from a long-running session.
 */
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_MAX_SIZE = 50

interface CacheEntry {
  expiresAt: number
  promise: Promise<SearchResult>
}

const cache = new Map<string, CacheEntry>()

function cacheKey(query: string, limit: number, providers: ApiProvider[]): string {
  return `${query.trim().toLowerCase()}|${String(limit)}|${providers.map(p => p.name).sort().join(',')}`
}

function evictExpired(now: number) {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key)
  }
  if (cache.size > CACHE_MAX_SIZE) {
    // Evict oldest until under limit (Map preserves insertion order)
    const excess = cache.size - CACHE_MAX_SIZE
    let i = 0
    for (const key of cache.keys()) {
      if (i++ >= excess) break
      cache.delete(key)
    }
  }
}

/** @internal exposed so tests can reset cache between cases. */
export function __clearSearchCache() {
  cache.clear()
}

/**
 * Search all configured providers in parallel.
 * Parfumo (local dataset) is always searched first if available.
 * Online APIs are searched in parallel alongside.
 * Partial failures are captured as errors but don't block other results.
 * Identical queries within a 5-minute window reuse the in-flight / cached result.
 */
export async function searchAllApis(query: string, limit = 20): Promise<SearchResult> {
  const allProviders: ApiProvider[] = []

  // Parfumo (local dataset) is always included if loaded
  if (parfumoProvider.isConfigured()) {
    allProviders.push(parfumoProvider)
  }

  // Add configured online providers
  const configuredOnline = onlineProviders.filter(p => p.isConfigured())
  allProviders.push(...configuredOnline)

  if (allProviders.length === 0) {
    return { results: [], errors: [], providersQueried: 0 }
  }

  const now = Date.now()
  evictExpired(now)

  const key = cacheKey(query, limit, allProviders)
  const cached = cache.get(key)
  if (cached && cached.expiresAt > now) {
    return cached.promise
  }

  const promise = (async () => {
    const settled = await Promise.allSettled(
      allProviders.map(provider => provider.search(query, limit)),
    )

    const allResults: Perfume[] = []
    const errors: SearchResult['errors'] = []

    settled.forEach((result, i) => {
      const provider = allProviders[i]
      if (result.status === 'fulfilled') {
        allResults.push(...result.value)
      } else {
        errors.push({
          provider: provider.name,
          error: result.reason instanceof Error ? result.reason.message : 'Error desconocido',
        })
      }
    })

    const results = deduplicateAndMerge(allResults)

    return {
      results,
      errors,
      providersQueried: allProviders.length,
    }
  })()

  // Cache the promise immediately so concurrent calls dedupe.
  // If it rejects, remove so the next caller can retry.
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, promise })
  promise.catch(() => cache.delete(key))

  return promise
}

/** Search only remote providers. The Parfumo dataset is already included in local search. */
export async function searchOnlineApis(query: string, limit = 20): Promise<SearchResult> {
  const providers = onlineProviders.filter(provider => provider.isConfigured())
  if (providers.length === 0) return { results: [], errors: [], providersQueried: 0 }

  const now = Date.now()
  evictExpired(now)
  const key = cacheKey(query, limit, providers)
  const cached = cache.get(key)
  if (cached && cached.expiresAt > now) return cached.promise

  const promise = (async () => {
    const settled = await Promise.allSettled(providers.map(provider => provider.search(query, limit)))
    const results: Perfume[] = []
    const errors: SearchResult['errors'] = []
    settled.forEach((result, index) => {
      if (result.status === 'fulfilled') results.push(...result.value)
      else errors.push({
        provider: providers[index].name,
        error: result.reason instanceof Error ? result.reason.message : 'Error desconocido',
      })
    })
    return { results: deduplicateAndMerge(results), errors, providersQueried: providers.length }
  })()

  cache.set(key, { expiresAt: now + CACHE_TTL_MS, promise })
  promise.catch(() => cache.delete(key))
  return promise
}

/**
 * Check if at least one search provider is available (including local dataset).
 */
export function isAnyApiConfigured(): boolean {
  return parfumoProvider.isConfigured() || onlineProviders.some(p => p.isConfigured())
}

export function isAnyOnlineApiConfigured(): boolean {
  return onlineProviders.some(provider => provider.isConfigured())
}

/**
 * Get status of all providers (for settings UI).
 */
export function getProvidersStatus(): { name: string; configured: boolean }[] {
  return [
    { name: parfumoProvider.name, configured: parfumoProvider.isConfigured() },
    ...onlineProviders.map(p => ({ name: p.name, configured: p.isConfigured() })),
  ]
}
