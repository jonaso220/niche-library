import type { Perfume } from '@/types/perfume'
import type { ApiProvider, SearchResult } from '@/api/types'
import { generateSlug } from '@/lib/utils'
import { fragellaProvider } from '@/api/fragella'
import { fragranceFinderProvider } from '@/api/fragrancefinder'

/**
 * Priority order: providers listed first win in merge conflicts.
 * Fragella provides the richest data (accords, seasons, occasions).
 */
const providers: ApiProvider[] = [
  fragellaProvider,
  fragranceFinderProvider,
]

/**
 * Data richness score — used to decide which duplicate to keep.
 * Higher = more complete data.
 */
function richnessScore(p: Perfume): number {
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
 */
function deduplicateAndMerge(allResults: Perfume[]): Perfume[] {
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
 * Search all configured API providers in parallel.
 * Partial failures are captured as errors but don't block other results.
 */
export async function searchAllApis(query: string, limit = 10): Promise<SearchResult> {
  const configuredProviders = providers.filter(p => p.isConfigured())

  if (configuredProviders.length === 0) {
    return { results: [], errors: [], providersQueried: 0 }
  }

  const settled = await Promise.allSettled(
    configuredProviders.map(provider => provider.search(query, limit))
  )

  const allResults: Perfume[] = []
  const errors: SearchResult['errors'] = []

  settled.forEach((result, i) => {
    const provider = configuredProviders[i]
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
    providersQueried: configuredProviders.length,
  }
}

/**
 * Check if at least one API provider is configured.
 */
export function isAnyApiConfigured(): boolean {
  return providers.some(p => p.isConfigured())
}

/**
 * Get status of all providers (for settings UI).
 */
export function getProvidersStatus(): { name: string; configured: boolean }[] {
  return providers.map(p => ({ name: p.name, configured: p.isConfigured() }))
}
