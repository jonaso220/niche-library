import type { Perfume } from '@/types/perfume'
import type { ApiProvider } from '@/api/types'
import { generateSlug } from '@/lib/utils'
import { mapGender, mapConcentration, buildDefaultSeasonScores, buildDefaultOccasionScores } from '@/api/mappers'

const BASE_URL = 'https://fragrancefinder-api.p.rapidapi.com'
const RAPIDAPI_HOST = 'fragrancefinder-api.p.rapidapi.com'

function getApiKey(): string | null {
  return import.meta.env.VITE_FRAGRANCEFINDER_API_KEY || localStorage.getItem('fragrancefinder_api_key')
}

/**
 * Response shape from FragranceFinder API
 * Fields may vary — we handle missing data gracefully
 */
interface FFFragrance {
  objectID?: string
  name?: string
  brand?: string
  description?: string
  image?: string
  imageId?: string | number
  concentration?: string
  gender?: string
  notes?: string | string[] | {
    top?: string[]
    middle?: string[]
    base?: string[]
  }
  scent_notes?: string[]
  rating?: number
  year?: number
}

function extractNotes(raw: FFFragrance): Perfume['notes'] {
  const empty = { top: [], middle: [], base: [] }

  if (!raw.notes && !raw.scent_notes) return empty

  // If notes is a structured object with top/middle/base
  if (raw.notes && typeof raw.notes === 'object' && !Array.isArray(raw.notes)) {
    const n = raw.notes as { top?: string[]; middle?: string[]; base?: string[] }
    return {
      top: (n.top ?? []).map(name => ({ name })),
      middle: (n.middle ?? []).map(name => ({ name })),
      base: (n.base ?? []).map(name => ({ name })),
    }
  }

  // If notes is a flat array or scent_notes exists, put them all as top notes
  const notesList = Array.isArray(raw.notes)
    ? raw.notes
    : raw.scent_notes ?? (typeof raw.notes === 'string' ? raw.notes.split(',').map(s => s.trim()) : [])

  return {
    top: notesList.map((name: string) => ({ name })),
    middle: [],
    base: [],
  }
}

function buildImageUrl(raw: FFFragrance): string | undefined {
  if (raw.image && raw.image.startsWith('http')) return raw.image
  if (raw.imageId) return `https://fimgs.net/mdimg/perfume/375x500.${raw.imageId}.jpg`
  return undefined
}

function transformToLocal(raw: FFFragrance): Perfume {
  const brand = raw.brand ?? 'Unknown'
  const name = raw.name ?? 'Unknown'

  return {
    id: generateSlug(brand, name, raw.concentration),
    name,
    brand,
    year: raw.year,
    gender: mapGender(raw.gender),
    concentration: mapConcentration(raw.concentration),
    rating: raw.rating ?? 0,
    longevity: 5,
    sillage: 5,
    notes: extractNotes(raw),
    accords: [],
    seasonScores: buildDefaultSeasonScores(),
    occasionScores: buildDefaultOccasionScores(),
    imageUrl: buildImageUrl(raw),
    description: raw.description,
    dataSource: 'fragrancefinder',
  }
}

async function search(query: string, limit = 10): Promise<Perfume[]> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('No se ha configurado la API key de FragranceFinder.')
  }

  const res = await fetch(
    `${BASE_URL}/perfumes/search?keyword=${encodeURIComponent(query)}&perPage=${limit}`,
    {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    }
  )

  if (!res.ok) {
    if (res.status === 429) throw new Error('Límite de búsquedas FragranceFinder alcanzado.')
    if (res.status === 401 || res.status === 403) throw new Error('API key de FragranceFinder inválida.')
    throw new Error(`Error FragranceFinder API: ${res.status}`)
  }

  const data = await res.json()

  // Handle various response shapes
  const results: FFFragrance[] = Array.isArray(data)
    ? data
    : data.results ?? data.hits ?? data.data ?? []

  return results.map(transformToLocal)
}

export function isFragranceFinderConfigured(): boolean {
  return !!getApiKey()
}

/** FragranceFinder provider implementing the ApiProvider interface */
export const fragranceFinderProvider: ApiProvider = {
  name: 'FragranceFinder',
  isConfigured: () => !!getApiKey(),
  search,
}
