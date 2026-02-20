import type { Perfume } from '@/types/perfume'

export interface ApiProvider {
  name: string
  isConfigured(): boolean
  search(query: string, limit?: number): Promise<Perfume[]>
}

export interface SearchResult {
  results: Perfume[]
  errors: { provider: string; error: string }[]
  /** How many providers were queried */
  providersQueried: number
}
