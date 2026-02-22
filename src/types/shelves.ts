import type { ShelfPerfume } from './perfume'

export type ShelfType =
  | 'season-spring' | 'season-summer' | 'season-fall' | 'season-winter'
  | 'family-woody' | 'family-oriental' | 'family-fresh' | 'family-floral'
  | 'family-aromatic' | 'family-citrus'
  | 'all' | 'wishlist'

export interface ShelfDefinition {
  id: ShelfType
  label: string
  icon: string
  description: string
  category: 'temporada' | 'familia' | 'coleccion'
  filterFn: (p: ShelfPerfume) => boolean
  /** Optional limit — only show top N results after sorting */
  limit?: number
}
