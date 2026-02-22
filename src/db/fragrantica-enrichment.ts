/**
 * Fragrantica Enrichment Module
 *
 * Enriches perfumes in the local database with detailed notes, accords, and ratings
 * scraped from Fragrantica. This data is applied on every app init and after cloud syncs
 * to ensure it persists even when Firebase overwrites local data.
 *
 * The enrichment data file (fragrantica-enrichment.json) uses a compact format:
 *   f = fragranticaId, a = accords [[name, pct]], n = notes {t, m, b}, r = rating
 */
import { db } from './database'
import enrichmentRaw from '@/data/fragrantica-enrichment.json'

interface CompactEntry {
  f: string
  a: [string, number][]
  n: { t: string[]; m: string[]; b: string[] }
  r: number
}

// Build lookup map once at module load
const enrichmentMap = new Map<string, CompactEntry>()
for (const entry of enrichmentRaw as CompactEntry[]) {
  enrichmentMap.set(entry.f, entry)
}

/**
 * Apply Fragrantica enrichment data to all perfumes that need it.
 * Matches by fragranticaId field or by extracting the ID from imageUrl.
 * Only updates if enrichment data has MORE notes/accords than current data.
 * Idempotent — safe to call on every app init.
 */
export async function applyFragranticaEnrichment(): Promise<number> {
  const all = await db.perfumes.toArray()
  let updated = 0

  for (const perfume of all) {
    // Determine fragranticaId from field or imageUrl
    let fId = perfume.fragranticaId
    if (!fId || fId === 'none' || fId === '') {
      const match = perfume.imageUrl?.match(/(\d+)\.jpg/)
      if (match) fId = match[1]
    }
    if (!fId) continue

    const enrichment = enrichmentMap.get(fId)
    if (!enrichment) continue

    // Skip entries with no enrichment data (e.g., Zara Absolutely Dark)
    const enrichNoteCount = enrichment.n.t.length + enrichment.n.m.length + enrichment.n.b.length
    const enrichAccordCount = enrichment.a.length
    if (enrichNoteCount === 0 && enrichAccordCount === 0 && !enrichment.r) continue

    const currentNoteCount =
      (perfume.notes?.top?.length || 0) +
      (perfume.notes?.middle?.length || 0) +
      (perfume.notes?.base?.length || 0)
    const currentAccordCount = perfume.accords?.length || 0

    let changed = false

    // Update notes if enrichment has more
    if (enrichNoteCount > currentNoteCount) {
      perfume.notes = {
        top: enrichment.n.t.map(name => ({ name })),
        middle: enrichment.n.m.map(name => ({ name })),
        base: enrichment.n.b.map(name => ({ name })),
      }
      changed = true
    }

    // Update accords if enrichment has more
    if (enrichAccordCount > currentAccordCount) {
      perfume.accords = enrichment.a.map(([name, percentage]) => ({ name, percentage }))
      changed = true
    }

    // Update rating if enrichment has one and current is default
    if (enrichment.r && (perfume.rating === 3 || perfume.rating === 0)) {
      perfume.rating = enrichment.r
      changed = true
    }

    // Set fragranticaId if missing
    if (!perfume.fragranticaId || perfume.fragranticaId === 'none' || perfume.fragranticaId === '') {
      perfume.fragranticaId = fId
      changed = true
    }

    if (changed) {
      await db.perfumes.put(perfume)
      updated++
    }
  }

  if (updated > 0) {
    console.log(`[NicheLibrary] Enriched ${updated} perfumes with Fragrantica data`)
  }
  return updated
}
