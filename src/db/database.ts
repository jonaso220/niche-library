import Dexie, { type Table } from 'dexie'
import type { Perfume, CollectionEntry } from '@/types/perfume'

export class NicheLibraryDB extends Dexie {
  perfumes!: Table<Perfume, string>
  collection!: Table<CollectionEntry, string>

  constructor() {
    super('NicheLibraryDB')
    this.version(1).stores({
      perfumes: 'id, name, brand, rating',
      collection: 'perfumeId, addedAt, owned',
    })
  }
}

export const db = new NicheLibraryDB()
