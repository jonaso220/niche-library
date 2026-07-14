import { db, type ParfumoEntry } from './database'
import { generateSlug } from '@/lib/utils'

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
  } catch (err) {
    console.error('Failed to load Parfumo dataset:', err)
    throw err
  }
}

/**
 * Search the Parfumo dataset in IndexedDB.
 * Uses a case-insensitive scan — IndexedDB doesn't support full-text search,
 * so we filter in JS after fetching candidates by brand prefix or doing a full scan.
 */
export async function searchParfumo(query: string, limit = 20): Promise<ParfumoEntry[]> {
  if (!isParfumoLoaded()) return []

  const q = query.toLowerCase().trim()
  if (!q) return []

  // Split query into words for multi-term matching
  const terms = q.split(/\s+/).filter(t => t.length >= 2)
  if (terms.length === 0) return []

  // Use Dexie's Collection.filter() for a full scan with early termination
  const results: ParfumoEntry[] = []

  await db.parfumo
    .orderBy('rating')
    .reverse()
    .filter(entry => {
      const nameL = entry.name.toLowerCase()
      const brandL = entry.brand.toLowerCase()
      const searchable = `${nameL} ${brandL}`
      return terms.every(term => searchable.includes(term))
    })
    .until(() => results.length >= limit)
    .each(entry => {
      results.push(entry)
    })

  return results
}
