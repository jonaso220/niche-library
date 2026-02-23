import type { ShelfDefinition } from '@/types/shelves'

const SEASON_THRESHOLD = 50
const ACCORD_THRESHOLD = 20

export const SHELF_DEFINITIONS: ShelfDefinition[] = [
  // Colección
  {
    id: 'all',
    label: 'Mi Colección',
    icon: 'Library',
    description: 'Todos tus perfumes',
    category: 'coleccion',
    filterFn: (p) => p.collectionData.owned,
  },
  {
    id: 'wishlist',
    label: 'Lista de Deseos',
    icon: 'Heart',
    description: 'Perfumes que quieres tener',
    category: 'coleccion',
    filterFn: (p) => !p.collectionData.owned && !p.collectionData.previouslyOwned,
  },
  {
    id: 'previously-owned',
    label: 'Fragancias Anteriores',
    icon: 'Archive',
    description: 'Perfumes que ya no tienes',
    category: 'coleccion',
    filterFn: (p) => !!p.collectionData.previouslyOwned,
  },
  // Temporadas (solo owned)
  {
    id: 'season-spring',
    label: 'Primavera',
    icon: 'Flower2',
    description: 'Ideales para primavera',
    category: 'temporada',
    filterFn: (p) => p.collectionData.owned && (p.seasonScores.find(s => s.season === 'spring')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'season-summer',
    label: 'Verano',
    icon: 'Sun',
    description: 'Ideales para verano',
    category: 'temporada',
    filterFn: (p) => p.collectionData.owned && (p.seasonScores.find(s => s.season === 'summer')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'season-fall',
    label: 'Otoño',
    icon: 'Leaf',
    description: 'Ideales para otoño',
    category: 'temporada',
    filterFn: (p) => p.collectionData.owned && (p.seasonScores.find(s => s.season === 'fall')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'season-winter',
    label: 'Invierno',
    icon: 'Snowflake',
    description: 'Ideales para invierno',
    category: 'temporada',
    filterFn: (p) => p.collectionData.owned && (p.seasonScores.find(s => s.season === 'winter')?.score ?? 0) >= SEASON_THRESHOLD,
  },

  // Familias olfativas (solo owned)
  {
    id: 'family-woody',
    label: 'Amaderado',
    icon: 'TreePine',
    description: 'Notas de madera dominantes',
    category: 'familia',
    filterFn: (p) => p.collectionData.owned && p.accords.some(a =>
      ['woody', 'amaderado', 'warm spicy', 'oud'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-oriental',
    label: 'Oriental',
    icon: 'Flame',
    description: 'Notas orientales y especiadas',
    category: 'familia',
    filterFn: (p) => p.collectionData.owned && p.accords.some(a =>
      ['oriental', 'amber', 'sweet', 'balsamic', 'ámbar'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-fresh',
    label: 'Fresco',
    icon: 'Wind',
    description: 'Fragancias frescas y acuáticas',
    category: 'familia',
    filterFn: (p) => p.collectionData.owned && p.accords.some(a =>
      ['fresh', 'aquatic', 'ozonic', 'green', 'fresco', 'acuático'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-floral',
    label: 'Floral',
    icon: 'Flower',
    description: 'Notas florales dominantes',
    category: 'familia',
    filterFn: (p) => p.collectionData.owned && p.accords.some(a =>
      ['floral', 'white floral', 'rose', 'floral blanco'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-aromatic',
    label: 'Aromático',
    icon: 'Leaf',
    description: 'Hierbas y aromáticas',
    category: 'familia',
    filterFn: (p) => p.collectionData.owned && p.accords.some(a =>
      ['aromatic', 'herbal', 'lavender', 'aromático'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-citrus',
    label: 'Cítrico',
    icon: 'Citrus',
    description: 'Notas cítricas frescas',
    category: 'familia',
    filterFn: (p) => p.collectionData.owned && p.accords.some(a =>
      ['citrus', 'cítrico', 'fresh spicy'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
]

export function getShelfDefinition(shelfId: string): ShelfDefinition | undefined {
  return SHELF_DEFINITIONS.find(s => s.id === shelfId)
}

export function getShelfsByCategory(category: ShelfDefinition['category']): ShelfDefinition[] {
  return SHELF_DEFINITIONS.filter(s => s.category === category)
}

/* ── Filtros inline para vistas de temporada ── */

export const TIME_FILTERS = [
  { id: 'day', label: 'Día', icon: 'SunMedium' },
  { id: 'night', label: 'Noche', icon: 'Moon' },
  { id: 'versatile', label: 'Versátil', icon: 'Clock' },
] as const

export const OCCASION_FILTERS = [
  { id: 'professional', label: 'Profesional', icon: 'Briefcase' },
  { id: 'casual', label: 'Casual', icon: 'Shirt' },
  { id: 'nightOut', label: 'Salida Nocturna', icon: 'PartyPopper' },
  { id: 'date', label: 'Cita', icon: 'HeartHandshake' },
  { id: 'special', label: 'Evento Especial', icon: 'Sparkles' },
] as const
