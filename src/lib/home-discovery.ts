import type { Perfume, Season, ShelfPerfume } from '@/types/perfume'

const DISCOVERY_LIMIT = 8
const SEASON_SCORE_THRESHOLD = 50

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'primavera',
  summer: 'verano',
  fall: 'otoño',
  winter: 'invierno',
}

export interface HomeDiscovery {
  season: Season
  featured?: Perfume
  discover: Perfume[]
  rediscover: ShelfPerfume[]
  wishlist: ShelfPerfume[]
}

export function getSouthernSeason(date: Date): Season {
  const month = date.getMonth()
  if (month === 11 || month <= 1) return 'summer'
  if (month <= 4) return 'fall'
  if (month <= 7) return 'winter'
  return 'spring'
}

function localDateKey(date: Date): string {
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const shuffled = [...items]
  const random = seededRandom(hashString(seed))

  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[target]
    shuffled[target] = current
  }

  return shuffled
}

function scoreForSeason(perfume: Perfume, season: Season): number {
  return perfume.seasonScores.find(score => score.season === season)?.score ?? 0
}

/**
 * Builds a homepage selection that is stable for the day, rotates on demand,
 * favors the current Southern Hemisphere season and never repeats an item
 * between visible sections.
 */
export function buildHomeDiscovery(
  catalog: readonly Perfume[],
  collection: readonly ShelfPerfume[],
  date: Date,
  rotation = 0,
): HomeDiscovery {
  const season = getSouthernSeason(date)
  const dateSeed = localDateKey(date)
  const collectionIds = new Set(collection.map(perfume => perfume.id))
  const unseenCatalog = catalog.filter(perfume => !collectionIds.has(perfume.id))
  const seasonalUnseen = unseenCatalog.filter(perfume =>
    scoreForSeason(perfume, season) >= SEASON_SCORE_THRESHOLD,
  )

  const preferredFeatured = seasonalUnseen.filter(perfume => perfume.imageUrl)
  const featuredPool = preferredFeatured.length > 0
    ? preferredFeatured
    : seasonalUnseen.length > 0
      ? seasonalUnseen
      : unseenCatalog.length > 0
        ? unseenCatalog
        : catalog

  const featuredOrder = seededShuffle(featuredPool, `${dateSeed}:featured`)
  const normalizedRotation = featuredOrder.length > 0
    ? ((rotation % featuredOrder.length) + featuredOrder.length) % featuredOrder.length
    : 0
  const featured = featuredOrder[normalizedRotation]
  const usedIds = new Set(featured ? [featured.id] : [])

  const discover = seededShuffle(
    unseenCatalog.filter(perfume => !usedIds.has(perfume.id)),
    `${dateSeed}:discover:${String(rotation)}`,
  ).slice(0, DISCOVERY_LIMIT)
  discover.forEach(perfume => usedIds.add(perfume.id))

  const rediscover = seededShuffle(
    collection.filter(perfume => perfume.collectionData.owned && !usedIds.has(perfume.id)),
    `${dateSeed}:rediscover:${String(rotation)}`,
  ).slice(0, DISCOVERY_LIMIT)
  rediscover.forEach(perfume => usedIds.add(perfume.id))

  const wishlist = seededShuffle(
    collection.filter(perfume =>
      !perfume.collectionData.owned &&
      !perfume.collectionData.previouslyOwned &&
      !usedIds.has(perfume.id),
    ),
    `${dateSeed}:wishlist:${String(rotation)}`,
  ).slice(0, DISCOVERY_LIMIT)

  return { season, featured, discover, rediscover, wishlist }
}
