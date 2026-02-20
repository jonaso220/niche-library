import type { Gender, Concentration, SeasonScore, OccasionScore } from '@/types/perfume'

export function mapGender(raw?: string): Gender {
  if (!raw) return 'unisex'
  const lower = raw.toLowerCase()
  if (lower.includes('men') || lower.includes('male') || lower.includes('him') || lower.includes('masculin')) return 'masculino'
  if (lower.includes('women') || lower.includes('female') || lower.includes('her') || lower.includes('feminin')) return 'femenino'
  return 'unisex'
}

export function mapConcentration(raw?: string): Concentration {
  if (!raw) return 'Other'
  const upper = raw.toUpperCase()
  if (upper.includes('EXTRAIT') || upper.includes('ELIXIR')) return 'Extrait'
  if (upper.includes('EDP') || upper.includes('EAU DE PARFUM')) return 'EDP'
  if (upper.includes('EDT') || upper.includes('EAU DE TOILETTE')) return 'EDT'
  if (upper.includes('EDC') || upper.includes('EAU DE COLOGNE')) return 'EDC'
  if (upper.includes('PARFUM')) return 'Parfum'
  return 'Other'
}

export function buildDefaultSeasonScores(): SeasonScore[] {
  return [
    { season: 'spring', score: 5 },
    { season: 'summer', score: 5 },
    { season: 'fall', score: 5 },
    { season: 'winter', score: 5 },
  ]
}

export function buildDefaultOccasionScores(): OccasionScore[] {
  return [
    { occasion: 'professional', score: 5 },
    { occasion: 'casual', score: 5 },
    { occasion: 'nightOut', score: 5 },
    { occasion: 'date', score: 5 },
    { occasion: 'special', score: 5 },
  ]
}
