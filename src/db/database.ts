import Dexie, { type Table } from 'dexie'
import type { Perfume, CollectionEntry } from '@/types/perfume'

export interface ParfumoEntry {
  /** Auto-generated slug: brand-name-concentration */
  id: string
  name: string
  brand: string
  year: number
  concentration: string
  rating: number
  accords: string
  topNotes: string
  midNotes: string
  baseNotes: string
}

export class NicheLibraryDB extends Dexie {
  perfumes!: Table<Perfume, string>
  collection!: Table<CollectionEntry, string>
  parfumo!: Table<ParfumoEntry, string>

  constructor() {
    super('NicheLibraryDB')
    this.version(1).stores({
      perfumes: 'id, name, brand, rating',
      collection: 'perfumeId, addedAt, owned',
    })
    this.version(2).stores({
      perfumes: 'id, name, brand, rating',
      collection: 'perfumeId, addedAt, owned',
      parfumo: 'id, name, brand, rating',
    })
  }
}

export const db = new NicheLibraryDB()
