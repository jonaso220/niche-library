import { db, type ParfumoEntry } from './database'
import { generateSlug } from '@/lib/utils'
import {
  normalizeFragranceText,
  prepareFragranceSearchDocument,
  prepareFragranceSearchQuery,
  scorePreparedFragranceMatch,
  type PreparedFragranceSearchDocument,
} from '@/lib/fragrance-search'

const PARFUMO_LOADED_KEY = 'niche-library-parfumo-v'
const CURRENT_PARFUMO_VERSION = 3

/** Check if the Parfumo dataset has been loaded into IndexedDB */
export function isParfumoLoaded(): boolean {
  return localStorage.getItem(PARFUMO_LOADED_KEY) === String(CURRENT_PARFUMO_VERSION)
}

export function clearParfumoMarker(): void {
  localStorage.removeItem(PARFUMO_LOADED_KEY)
}

const CORRUPTED_NOTES = new Set([
  'rot', 'rotten onion', 'mildew', 'sock', 'staleness', 'flibtix', 'grim', 'fume',
])

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function sanitizeParfumoName(name: string, brand: string, year: number, concentration: string): string {
  const original = name.trim()
  let clean = original
  const suffixes = [concentration, year ? String(year) : '', brand].filter(Boolean)
  // Repeat because source rows do not use one consistent suffix order.
  for (let pass = 0; pass < suffixes.length; pass++) {
    const before = clean
    for (const suffix of suffixes) {
      clean = clean.replace(new RegExp(`(?:\\s+|^)${escapeRegExp(suffix)}$`, 'i'), '').trim()
    }
    if (clean === before) break
  }
  return clean || original
}

export function sanitizeNotes(raw: unknown): string {
  const value = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : ''
  return value
    .split(',')
    .map(note => note.trim())
    .filter(note => note && !CORRUPTED_NOTES.has(note.toLowerCase()))
    .join(', ')
}

/** Check if dataset is currently being loaded */
let loadingPromise: Promise<void> | null = null

interface IndexedParfumoEntry {
  entry: ParfumoEntry
  search: PreparedFragranceSearchDocument
}

let searchIndexPromise: Promise<IndexedParfumoEntry[]> | null = null
const searchCache = new Map<string, ParfumoEntry[]>()

function resetSearchIndex(): void {
  searchIndexPromise = null
  searchCache.clear()
}

function getSearchIndex(): Promise<IndexedParfumoEntry[]> {
  if (!searchIndexPromise) {
    searchIndexPromise = db.parfumo.toArray().then(entries => entries.map(entry => ({
      entry,
      search: prepareFragranceSearchDocument(entry),
    })))
    searchIndexPromise.catch(() => {
      searchIndexPromise = null
    })
  }
  return searchIndexPromise
}

/**
 * Load the Parfumo dataset (59K fragrances) into IndexedDB.
 * Downloads JSON from /parfumo-dataset.json and bulk-inserts into the parfumo table.
 * Only runs once — subsequent calls are no-ops.
 */
export async function loadParfumoDataset(): Promise<void> {
  if (isParfumoLoaded()) {
    const hasRows = await db.parfumo.limit(1).count()
    if (hasRows > 0) return
    clearParfumoMarker()
  }

  // Deduplicate concurrent calls
  if (loadingPromise) return loadingPromise

  loadingPromise = doLoad()
  try {
    await loadingPromise
  } finally {
    loadingPromise = null
  }
}

async function doLoad(): Promise<void> {
  try {
    const res = await fetch('/parfumo-dataset.json')
    if (!res.ok) throw new Error(`Failed to load dataset: ${res.status}`)

    const raw = (await res.json()) as unknown[][]

    // Version changes may alter IDs after normalization; remove stale entries.
    resetSearchIndex()
    await db.parfumo.clear()

    // Transform array-of-arrays to ParfumoEntry objects
    // Format: [name, brand, year, concentration, rating, accords, topNotes, midNotes, baseNotes, imageUrl]
    const BATCH_SIZE = 5000
    for (let i = 0; i < raw.length; i += BATCH_SIZE) {
      const batch = raw.slice(i, i + BATCH_SIZE) as (string | number)[][]
      const entries: ParfumoEntry[] = batch.map(row => {
        const brand = String(row[1]).trim()
        const year = Number(row[2]) || 0
        const concentration = String(row[3]).trim()
        const name = sanitizeParfumoName(String(row[0]), brand, year, concentration)
        return {
          id: generateSlug(brand, name, concentration),
          name,
          brand,
          year,
          concentration,
          rating: Number(row[4]) || 0,
          accords: sanitizeNotes(row[5]),
          topNotes: sanitizeNotes(row[6]),
          midNotes: sanitizeNotes(row[7]),
          baseNotes: sanitizeNotes(row[8]),
          imageUrl: row[9] ? String(row[9]) : '',
        }
      })

      await db.parfumo.bulkPut(entries)
    }

    localStorage.setItem(PARFUMO_LOADED_KEY, String(CURRENT_PARFUMO_VERSION))
    resetSearchIndex()
  } catch (err) {
    console.error('Failed to load Parfumo dataset:', err)
    throw err
  }
}

/**
 * Search the Parfumo dataset using an in-memory normalized index. Results are
 * ranked by relevance and tolerate accents, punctuation, token order and small
 * spelling mistakes. The index is created lazily once per browser session.
 */
export async function searchParfumo(query: string, limit = 20): Promise<ParfumoEntry[]> {
  if (!isParfumoLoaded()) return []

  const preparedQuery = prepareFragranceSearchQuery(query)
  if (!preparedQuery.normalized || preparedQuery.normalized.length < 2) return []

  const normalizedLimit = Math.max(1, limit)
  const cacheKey = `${normalizeFragranceText(query)}|${String(normalizedLimit)}`
  const cached = searchCache.get(cacheKey)
  if (cached) return cached

  const index = await getSearchIndex()
  const scored: Array<{ entry: ParfumoEntry; score: number }> = []

  for (const indexedEntry of index) {
    const score = scorePreparedFragranceMatch(preparedQuery, indexedEntry.search)
    if (score >= 0.68) scored.push({ entry: indexedEntry.entry, score })
  }

  scored.sort((left, right) =>
    right.score - left.score || right.entry.rating - left.entry.rating,
  )

  const results = scored.slice(0, normalizedLimit).map(result => result.entry)
  searchCache.set(cacheKey, results)
  if (searchCache.size > 50) searchCache.delete(searchCache.keys().next().value as string)
  return results
}
