import type { Perfume } from '@/types/perfume'
import type { ApiProvider } from '@/api/types'
import { generateSlug } from '@/lib/utils'
import { mapGender, mapConcentration } from '@/api/mappers'

const BASE_URL = 'https://api.fragella.com/api/v1'

function getApiKey(): string | null {
  return import.meta.env.VITE_FRAGELLA_API_KEY || localStorage.getItem('fragella_api_key')
}

interface FragellaNote {
  name: string
  imageUrl?: string
}

interface FragellaAccord {
  name: string
  level: string
  percentage?: number
}

interface FragellaSeason {
  season: string
  score: number
}

interface FragellaOccasion {
  occasion: string
  score: number
}

interface FragellaFragrance {
  Name: string
  Brand: string
  Year?: number
  Gender?: string
  OilType?: string
  rating?: number
  Longevity?: number
  Sillage?: number
  Notes?: {
    Top?: FragellaNote[]
    Middle?: FragellaNote[]
    Base?: FragellaNote[]
  }
  MainAccords?: FragellaAccord[]
  MainAccordsPercentage?: Record<string, string | number>
  SeasonRanking?: FragellaSeason[]
  OccasionRanking?: FragellaOccasion[]
  ImageUrl?: string
  SourceUrl?: string
  Confidence?: number
}

function mapAccordPercentage(level: string | number): number {
  if (typeof level === 'number') return level
  switch (level.toLowerCase()) {
    case 'dominant': return 85
    case 'prominent': return 65
    case 'moderate': return 40
    case 'subtle': return 20
    default: return 30
  }
}

function transformFragellaToLocal(raw: FragellaFragrance): Perfume {
  const accords = raw.MainAccordsPercentage
    ? Object.entries(raw.MainAccordsPercentage).map(([name, level]) => ({
        name,
        percentage: mapAccordPercentage(level),
      }))
    : (raw.MainAccords ?? []).map(a => ({
        name: a.name,
        percentage: a.percentage ?? mapAccordPercentage(a.level),
      }))

  return {
    id: generateSlug(raw.Brand, raw.Name, raw.OilType),
    name: raw.Name,
    brand: raw.Brand,
    year: raw.Year,
    gender: mapGender(raw.Gender),
    concentration: mapConcentration(raw.OilType),
    rating: raw.rating ?? 0,
    longevity: raw.Longevity ?? 5,
    sillage: raw.Sillage ?? 5,
    notes: {
      top: raw.Notes?.Top ?? [],
      middle: raw.Notes?.Middle ?? [],
      base: raw.Notes?.Base ?? [],
    },
    accords,
    seasonScores: (raw.SeasonRanking ?? []).map(s => ({
      season: s.season.toLowerCase() as Perfume['seasonScores'][0]['season'],
      score: s.score,
    })),
    occasionScores: (raw.OccasionRanking ?? []).map(o => ({
      occasion: o.occasion as Perfume['occasionScores'][0]['occasion'],
      score: o.score,
    })),
    imageUrl: raw.ImageUrl,
    sourceUrl: raw.SourceUrl,
    dataSource: 'fragella',
  }
}

export async function searchFragrances(query: string, limit = 10): Promise<Perfume[]> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('No se ha configurado la API key de Fragella. Ve a Ajustes para configurarla.')
  }

  const res = await fetch(
    `${BASE_URL}/fragrances?search=${encodeURIComponent(query)}&limit=${limit}`,
    { headers: { 'x-api-key': apiKey } }
  )

  if (!res.ok) {
    if (res.status === 429) throw new Error('Límite de búsquedas alcanzado este mes. Intenta agregar manualmente.')
    if (res.status === 401) throw new Error('API key inválida. Verifica tu configuración en Ajustes.')
    throw new Error(`Error de API: ${res.status}`)
  }

  const data = await res.json()
  const results = Array.isArray(data) ? data : data.results ?? data.data ?? []
  return results.map(transformFragellaToLocal)
}

export function isApiConfigured(): boolean {
  return !!getApiKey()
}

/** Fragella provider implementing the ApiProvider interface */
export const fragellaProvider: ApiProvider = {
  name: 'Fragella',
  isConfigured: () => !!getApiKey(),
  search: searchFragrances,
}
