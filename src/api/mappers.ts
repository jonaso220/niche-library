import type { Gender, Concentration, SeasonScore, OccasionScore, AccordStrength } from '@/types/perfume'

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

// ===================== ACCORD-BASED SCORE INFERENCE =====================

/** Accord groups mapped to season affinity (0-100 contribution) */
const SEASON_ACCORD_MAP: Record<string, { spring: number; summer: number; fall: number; winter: number }> = {
  // Fresh/Light → Spring & Summer
  'fresh':    { spring: 80, summer: 85, fall: 20, winter: 10 },
  'citrus':   { spring: 85, summer: 90, fall: 15, winter: 10 },
  'aquatic':  { spring: 70, summer: 90, fall: 15, winter: 5 },
  'ozonic':   { spring: 70, summer: 85, fall: 20, winter: 10 },
  'green':    { spring: 85, summer: 70, fall: 30, winter: 15 },
  'fruity':   { spring: 80, summer: 85, fall: 30, winter: 15 },
  // Warm/Heavy → Fall & Winter
  'woody':    { spring: 40, summer: 25, fall: 80, winter: 85 },
  'oud':      { spring: 15, summer: 10, fall: 75, winter: 90 },
  'warm spicy': { spring: 25, summer: 15, fall: 85, winter: 90 },
  'spicy':    { spring: 30, summer: 20, fall: 80, winter: 85 },
  'amber':    { spring: 25, summer: 15, fall: 80, winter: 90 },
  'oriental': { spring: 20, summer: 10, fall: 80, winter: 90 },
  'sweet':    { spring: 40, summer: 30, fall: 75, winter: 80 },
  'balsamic': { spring: 20, summer: 10, fall: 75, winter: 85 },
  'vanilla':  { spring: 35, summer: 20, fall: 75, winter: 85 },
  'tobacco':  { spring: 15, summer: 10, fall: 80, winter: 90 },
  'leather':  { spring: 20, summer: 10, fall: 75, winter: 90 },
  'smoky':    { spring: 10, summer: 5, fall: 70, winter: 90 },
  'musky':    { spring: 50, summer: 40, fall: 60, winter: 65 },
  // Floral → Spring mainly
  'floral':       { spring: 85, summer: 65, fall: 40, winter: 25 },
  'white floral': { spring: 80, summer: 70, fall: 30, winter: 20 },
  'rose':         { spring: 85, summer: 60, fall: 45, winter: 30 },
  // Aromatic → Versatile
  'aromatic': { spring: 65, summer: 55, fall: 65, winter: 55 },
  'herbal':   { spring: 70, summer: 60, fall: 55, winter: 40 },
  'lavender': { spring: 75, summer: 65, fall: 50, winter: 35 },
  // Powdery/Earthy
  'powdery':  { spring: 55, summer: 40, fall: 65, winter: 70 },
  'earthy':   { spring: 45, summer: 30, fall: 75, winter: 70 },
  // Additional Parfumo accords
  'gourmand': { spring: 35, summer: 25, fall: 75, winter: 85 },
  'creamy':   { spring: 45, summer: 35, fall: 65, winter: 75 },
  'resinous': { spring: 20, summer: 10, fall: 75, winter: 85 },
  'animal':   { spring: 15, summer: 10, fall: 70, winter: 85 },
  'leathery': { spring: 20, summer: 10, fall: 75, winter: 90 },
}

/** Accord groups mapped to occasion affinity */
const OCCASION_ACCORD_MAP: Record<string, { professional: number; casual: number; nightOut: number; date: number; special: number }> = {
  'fresh':    { professional: 80, casual: 85, nightOut: 30, date: 40, special: 30 },
  'citrus':   { professional: 80, casual: 90, nightOut: 25, date: 35, special: 25 },
  'aquatic':  { professional: 75, casual: 85, nightOut: 25, date: 35, special: 25 },
  'ozonic':   { professional: 75, casual: 80, nightOut: 30, date: 35, special: 30 },
  'green':    { professional: 70, casual: 80, nightOut: 25, date: 40, special: 30 },
  'fruity':   { professional: 55, casual: 80, nightOut: 50, date: 60, special: 45 },
  'woody':    { professional: 70, casual: 60, nightOut: 70, date: 75, special: 70 },
  'oud':      { professional: 40, casual: 30, nightOut: 85, date: 80, special: 90 },
  'warm spicy': { professional: 45, casual: 40, nightOut: 85, date: 80, special: 80 },
  'spicy':    { professional: 50, casual: 45, nightOut: 80, date: 75, special: 75 },
  'amber':    { professional: 45, casual: 40, nightOut: 85, date: 85, special: 80 },
  'oriental': { professional: 35, casual: 30, nightOut: 90, date: 85, special: 85 },
  'sweet':    { professional: 40, casual: 55, nightOut: 75, date: 80, special: 70 },
  'balsamic': { professional: 40, casual: 35, nightOut: 80, date: 75, special: 80 },
  'vanilla':  { professional: 40, casual: 50, nightOut: 75, date: 85, special: 70 },
  'tobacco':  { professional: 35, casual: 35, nightOut: 85, date: 70, special: 85 },
  'leather':  { professional: 50, casual: 35, nightOut: 85, date: 75, special: 85 },
  'smoky':    { professional: 25, casual: 20, nightOut: 85, date: 70, special: 85 },
  'musky':    { professional: 60, casual: 60, nightOut: 65, date: 70, special: 60 },
  'floral':   { professional: 60, casual: 70, nightOut: 55, date: 80, special: 65 },
  'white floral': { professional: 55, casual: 65, nightOut: 55, date: 80, special: 70 },
  'rose':     { professional: 55, casual: 60, nightOut: 60, date: 85, special: 75 },
  'aromatic': { professional: 75, casual: 75, nightOut: 50, date: 55, special: 50 },
  'herbal':   { professional: 70, casual: 75, nightOut: 40, date: 45, special: 40 },
  'lavender': { professional: 75, casual: 80, nightOut: 35, date: 45, special: 35 },
  'powdery':  { professional: 65, casual: 55, nightOut: 60, date: 70, special: 65 },
  'earthy':   { professional: 50, casual: 45, nightOut: 65, date: 55, special: 70 },
  // Additional Parfumo accords
  'gourmand': { professional: 30, casual: 50, nightOut: 80, date: 85, special: 75 },
  'creamy':   { professional: 50, casual: 55, nightOut: 65, date: 75, special: 65 },
  'resinous': { professional: 40, casual: 35, nightOut: 80, date: 70, special: 80 },
  'animal':   { professional: 25, casual: 20, nightOut: 80, date: 70, special: 85 },
  'leathery': { professional: 50, casual: 35, nightOut: 85, date: 75, special: 85 },
}

function matchAccordKey(accordName: string): string | null {
  const lower = accordName.toLowerCase()
  // Direct match first
  if (SEASON_ACCORD_MAP[lower]) return lower
  // Partial match
  for (const key of Object.keys(SEASON_ACCORD_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return key
  }
  return null
}

/**
 * Infer season scores from a perfume's accords.
 * Uses weighted average based on accord percentages.
 * Returns default low scores if no accords match.
 */
export function inferSeasonScores(accords: AccordStrength[]): SeasonScore[] {
  if (!accords || accords.length === 0) return buildDefaultSeasonScores()

  let spring = 0, summer = 0, fall = 0, winter = 0
  let totalWeight = 0

  for (const accord of accords) {
    const key = matchAccordKey(accord.name)
    if (!key) continue
    const map = SEASON_ACCORD_MAP[key]
    const weight = accord.percentage / 100
    spring += map.spring * weight
    summer += map.summer * weight
    fall += map.fall * weight
    winter += map.winter * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return buildDefaultSeasonScores()

  // Normalize and clamp to 0-100
  const norm = (v: number) => Math.round(Math.min(100, Math.max(0, v / totalWeight)))

  return [
    { season: 'spring', score: norm(spring) },
    { season: 'summer', score: norm(summer) },
    { season: 'fall', score: norm(fall) },
    { season: 'winter', score: norm(winter) },
  ]
}

/**
 * Infer occasion scores from a perfume's accords.
 * Uses weighted average based on accord percentages.
 * Returns default low scores if no accords match.
 */
export function inferOccasionScores(accords: AccordStrength[]): OccasionScore[] {
  if (!accords || accords.length === 0) return buildDefaultOccasionScores()

  let professional = 0, casual = 0, nightOut = 0, date = 0, special = 0
  let totalWeight = 0

  for (const accord of accords) {
    const key = matchAccordKey(accord.name)
    if (!key || !OCCASION_ACCORD_MAP[key]) continue
    const map = OCCASION_ACCORD_MAP[key]
    const weight = accord.percentage / 100
    professional += map.professional * weight
    casual += map.casual * weight
    nightOut += map.nightOut * weight
    date += map.date * weight
    special += map.special * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return buildDefaultOccasionScores()

  const norm = (v: number) => Math.round(Math.min(100, Math.max(0, v / totalWeight)))

  return [
    { occasion: 'professional', score: norm(professional) },
    { occasion: 'casual', score: norm(casual) },
    { occasion: 'nightOut', score: norm(nightOut) },
    { occasion: 'date', score: norm(date) },
    { occasion: 'special', score: norm(special) },
  ]
}
