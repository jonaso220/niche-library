import type { Perfume } from '@/types/perfume'
import type { ApiProvider } from '@/api/types'
import { generateSlug } from '@/lib/utils'
import { mapConcentration, inferSeasonScores, inferOccasionScores } from '@/api/mappers'
import { searchParfumo, isParfumoLoaded } from '@/db/parfumo-loader'
import type { ParfumoEntry } from '@/db/database'

function parseNotesList(raw: string): { name: string }[] {
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name }))
}

function mapGenderFromName(name: string, brand: string): Perfume['gender'] {
  const lower = `${name} ${brand}`.toLowerCase()
  if (lower.includes('pour homme') || lower.includes('for men') || lower.includes(' man ') || lower.includes(' him')) return 'masculino'
  if (lower.includes('pour femme') || lower.includes('for women') || lower.includes(' woman ') || lower.includes(' her')) return 'femenino'
  return 'unisex'
}

/** Image corrections for Parfumo entries with wrong or missing images */
const PARFUMO_IMAGE_FIXES: Record<string, string> = {
  'hugo-boss-boss-bottled-absolute': 'https://fimgs.net/mdimg/perfume/375x500.96246.jpg',
}

function parseAccords(raw: string): Perfume['accords'] {
  if (!raw) return []
  return raw.split(',').map((s, i, arr) => ({
    name: s.trim(),
    percentage: Math.round(80 - (i / arr.length) * 60), // First accord = ~80%, last = ~20%
  })).filter(a => a.name)
}

export function transformToLocal(entry: ParfumoEntry): Perfume {
  const accords = parseAccords(entry.accords)
  const id = generateSlug(entry.brand, entry.name, entry.concentration)
  const imageUrl = PARFUMO_IMAGE_FIXES[id] ?? (entry.imageUrl || undefined)
  return {
    id,
    name: entry.name,
    brand: entry.brand,
    year: entry.year || undefined,
    gender: mapGenderFromName(entry.name, entry.brand),
    concentration: mapConcentration(entry.concentration),
    rating: entry.rating ? entry.rating / 2 : 0, // Parfumo uses 0-10, we use 0-5
    longevity: 5,
    sillage: 5,
    notes: {
      top: parseNotesList(entry.topNotes),
      middle: parseNotesList(entry.midNotes),
      base: parseNotesList(entry.baseNotes),
    },
    accords,
    seasonScores: inferSeasonScores(accords),
    occasionScores: inferOccasionScores(accords),
    imageUrl,
    dataSource: 'parfumo',
  }
}

async function search(query: string, limit = 20): Promise<Perfume[]> {
  const results = await searchParfumo(query, limit)
  return results.map(transformToLocal)
}

/** Parfumo dataset provider — 59K fragrances from Parfumo.com */
export const parfumoProvider: ApiProvider = {
  name: 'Parfumo',
  isConfigured: () => isParfumoLoaded(),
  search,
}
