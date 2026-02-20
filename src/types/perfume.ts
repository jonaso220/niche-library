export type Season = 'spring' | 'summer' | 'fall' | 'winter'
export type TimeOfDay = 'day' | 'night' | 'versatile'
export type Gender = 'masculino' | 'femenino' | 'unisex'
export type Concentration = 'EDT' | 'EDP' | 'Extrait' | 'Parfum' | 'EDC' | 'Other'
export type OccasionType = 'professional' | 'casual' | 'nightOut' | 'date' | 'special'
export type DataSource = 'fragella' | 'fragrancefinder' | 'manual' | 'seed'

export interface FragranceNote {
  name: string
  imageUrl?: string
}

export interface NotePyramid {
  top: FragranceNote[]
  middle: FragranceNote[]
  base: FragranceNote[]
}

export interface AccordStrength {
  name: string
  percentage: number
}

export interface SeasonScore {
  season: Season
  score: number
}

export interface OccasionScore {
  occasion: OccasionType
  score: number
}

export interface PriceEstimate {
  amountUYU: number
  source: string
  lastUpdated: string
  confidence: 'exact' | 'estimate' | 'unknown'
}

export interface Perfume {
  id: string
  name: string
  brand: string
  year?: number
  gender: Gender
  concentration: Concentration
  rating: number
  longevity: number
  sillage: number
  notes: NotePyramid
  accords: AccordStrength[]
  seasonScores: SeasonScore[]
  occasionScores: OccasionScore[]
  imageUrl?: string
  thumbnailUrl?: string
  description?: string
  sourceUrl?: string
  dataSource: DataSource
}

export interface CollectionEntry {
  perfumeId: string
  addedAt: string
  personalRating?: number
  personalNotes?: string
  owned: boolean
  priceEstimate?: PriceEstimate
  tags?: string[]
}

export interface ShelfPerfume extends Perfume {
  collectionData: CollectionEntry
  effectiveRating: number
}
