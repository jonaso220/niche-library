import { db, type ParfumoEntry } from './database'
import { generateSlug } from '@/lib/utils'

const PARFUMO_LOADED_KEY = 'niche-library-parfumo-v'
const CURRENT_PARFUMO_VERSION = 1

/** Check if the Parfumo dataset has been loaded into IndexedDB */
export function isParfumoLoaded(): boolean {
  return localStorage.getItem(PARFUMO_LOADED_KEY) === String(CURRENT_PARFUMO_VERSION)
}

/** Check if dataset is currently being loaded */
let loadingPromise: Promise<void> | null = null

/**
 * Load the Parfumo dataset (59K fragrances) into IndexedDB.
 * Downloads JSON from /parfumo-dataset.json and bulk-inserts into the parfumo table.
 * Only runs once — subsequent calls are no-ops.
 */
export async function loadParfumoDataset(): Promise<void> {
  if (isParfumoLoaded()) return

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

    const raw: unknown[][] = await res.json()

    // Transform array-of-arrays to ParfumoEntry objects
    // Format: [name, brand, year, concentration, rating, accords, topNotes, midNotes, baseNotes]
    const BATCH_SIZE = 5000
    for (let i = 0; i < raw.length; i += BATCH_SIZE) {
      const batch = raw.slice(i, i + BATCH_SIZE)
      const entries: ParfumoEntry[] = batch.map(row => ({
        id: generateSlug(String(row[1]), String(row[0]), String(row[3])),
        name: String(row[0]),
        brand: String(row[1]),
        year: Number(row[2]) || 0,
        concentration: String(row[3]),
        rating: Number(row[4]) || 0,
        accords: String(row[5]),
        topNotes: String(row[6]),
        midNotes: String(row[7]),
        baseNotes: String(row[8]),
      }))

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
