import type { ShelfDefinition } from '@/types/shelves'

const SEASON_THRESHOLD = 50
const ACCORD_THRESHOLD = 20
const TIME_HIGH = 60
const TIME_LOW = 40

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
    filterFn: (p) => !p.collectionData.owned,
  },
  {
    id: 'top-rated',
    label: 'Mejor Valorados',
    icon: 'Trophy',
    description: 'Rating 4.0 o superior',
    category: 'coleccion',
    filterFn: (p) => p.effectiveRating >= 4.0,
  },

  // Temporadas
  {
    id: 'season-spring',
    label: 'Primavera',
    icon: 'Flower2',
    description: 'Ideales para primavera',
    category: 'temporada',
    filterFn: (p) => (p.seasonScores.find(s => s.season === 'spring')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'season-summer',
    label: 'Verano',
    icon: 'Sun',
    description: 'Ideales para verano',
    category: 'temporada',
    filterFn: (p) => (p.seasonScores.find(s => s.season === 'summer')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'season-fall',
    label: 'Otoño',
    icon: 'Leaf',
    description: 'Ideales para otoño',
    category: 'temporada',
    filterFn: (p) => (p.seasonScores.find(s => s.season === 'fall')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'season-winter',
    label: 'Invierno',
    icon: 'Snowflake',
    description: 'Ideales para invierno',
    category: 'temporada',
    filterFn: (p) => (p.seasonScores.find(s => s.season === 'winter')?.score ?? 0) >= SEASON_THRESHOLD,
  },

  // Horario
  {
    id: 'time-day',
    label: 'Día',
    icon: 'SunMedium',
    description: 'Para uso diurno',
    category: 'horario',
    filterFn: (p) => {
      const casual = p.occasionScores.find(o => o.occasion === 'casual')?.score ?? 0
      const prof = p.occasionScores.find(o => o.occasion === 'professional')?.score ?? 0
      const night = p.occasionScores.find(o => o.occasion === 'nightOut')?.score ?? 0
      const dayScore = (casual + prof) / 2
      return dayScore >= TIME_HIGH || (dayScore >= TIME_LOW && night < TIME_HIGH)
    },
  },
  {
    id: 'time-night',
    label: 'Noche',
    icon: 'Moon',
    description: 'Para uso nocturno',
    category: 'horario',
    filterFn: (p) => {
      const night = p.occasionScores.find(o => o.occasion === 'nightOut')?.score ?? 0
      return night >= TIME_LOW
    },
  },
  {
    id: 'time-versatile',
    label: 'Versátil',
    icon: 'Clock',
    description: 'Sirven de día y de noche',
    category: 'horario',
    filterFn: (p) => {
      const casual = p.occasionScores.find(o => o.occasion === 'casual')?.score ?? 0
      const prof = p.occasionScores.find(o => o.occasion === 'professional')?.score ?? 0
      const night = p.occasionScores.find(o => o.occasion === 'nightOut')?.score ?? 0
      const dayScore = (casual + prof) / 2
      return dayScore >= TIME_LOW && night >= TIME_LOW
    },
  },

  // Ocasiones
  {
    id: 'occasion-professional',
    label: 'Profesional',
    icon: 'Briefcase',
    description: 'Para el trabajo u oficina',
    category: 'ocasion',
    filterFn: (p) => (p.occasionScores.find(o => o.occasion === 'professional')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'occasion-casual',
    label: 'Casual',
    icon: 'Shirt',
    description: 'Para el día a día',
    category: 'ocasion',
    filterFn: (p) => (p.occasionScores.find(o => o.occasion === 'casual')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'occasion-nightOut',
    label: 'Salida Nocturna',
    icon: 'PartyPopper',
    description: 'Para salir de noche',
    category: 'ocasion',
    filterFn: (p) => (p.occasionScores.find(o => o.occasion === 'nightOut')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'occasion-date',
    label: 'Cita',
    icon: 'HeartHandshake',
    description: 'Para una cita romántica',
    category: 'ocasion',
    filterFn: (p) => (p.occasionScores.find(o => o.occasion === 'date')?.score ?? 0) >= SEASON_THRESHOLD,
  },
  {
    id: 'occasion-special',
    label: 'Evento Especial',
    icon: 'Sparkles',
    description: 'Para ocasiones especiales',
    category: 'ocasion',
    filterFn: (p) => (p.occasionScores.find(o => o.occasion === 'special')?.score ?? 0) >= SEASON_THRESHOLD,
  },

  // Familias olfativas
  {
    id: 'family-woody',
    label: 'Amaderado',
    icon: 'TreePine',
    description: 'Notas de madera dominantes',
    category: 'familia',
    filterFn: (p) => p.accords.some(a =>
      ['woody', 'amaderado', 'warm spicy', 'oud'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-oriental',
    label: 'Oriental',
    icon: 'Flame',
    description: 'Notas orientales y especiadas',
    category: 'familia',
    filterFn: (p) => p.accords.some(a =>
      ['oriental', 'amber', 'sweet', 'balsamic', 'ámbar'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-fresh',
    label: 'Fresco',
    icon: 'Wind',
    description: 'Fragancias frescas y acuáticas',
    category: 'familia',
    filterFn: (p) => p.accords.some(a =>
      ['fresh', 'aquatic', 'ozonic', 'green', 'fresco', 'acuático'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-floral',
    label: 'Floral',
    icon: 'Flower',
    description: 'Notas florales dominantes',
    category: 'familia',
    filterFn: (p) => p.accords.some(a =>
      ['floral', 'white floral', 'rose', 'floral blanco'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-aromatic',
    label: 'Aromático',
    icon: 'Leaf',
    description: 'Hierbas y aromáticas',
    category: 'familia',
    filterFn: (p) => p.accords.some(a =>
      ['aromatic', 'herbal', 'lavender', 'aromático'].includes(a.name.toLowerCase()) && a.percentage >= ACCORD_THRESHOLD
    ),
  },
  {
    id: 'family-citrus',
    label: 'Cítrico',
    icon: 'Citrus',
    description: 'Notas cítricas frescas',
    category: 'familia',
    filterFn: (p) => p.accords.some(a =>
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
