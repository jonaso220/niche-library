import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './database'
import type { Perfume, CollectionEntry, ShelfPerfume } from '@/types/perfume'
import type { ShelfType } from '@/types/shelves'
import { getShelfDefinition } from '@/lib/constants'

export function useAllPerfumes(): Perfume[] | undefined {
  return useLiveQuery(() => db.perfumes.toArray())
}

export function usePerfumeById(id: string): Perfume | undefined {
  return useLiveQuery(() => db.perfumes.get(id), [id])
}

export function useCollection(): CollectionEntry[] | undefined {
  return useLiveQuery(() => db.collection.toArray())
}

export function useCollectionEntry(perfumeId: string): CollectionEntry | undefined {
  return useLiveQuery(() => db.collection.get(perfumeId), [perfumeId])
}

export function useCollectionPerfumes(): ShelfPerfume[] | undefined {
  return useLiveQuery(async () => {
    const entries = await db.collection.toArray()
    if (entries.length === 0) return []

    const perfumeIds = entries.map(e => e.perfumeId)
    const perfumes = await db.perfumes.where('id').anyOf(perfumeIds).toArray()

    return perfumes.map(p => {
      const entry = entries.find(e => e.perfumeId === p.id)!
      return {
        ...p,
        collectionData: entry,
        effectiveRating: entry.personalRating ?? p.rating,
      }
    })
  })
}

export function useShelfPerfumes(shelfId: ShelfType): ShelfPerfume[] | undefined {
  const all = useCollectionPerfumes()
  if (!all) return undefined

  const shelf = getShelfDefinition(shelfId)
  if (!shelf) return []

  return all
    .filter(shelf.filterFn)
    .sort((a, b) => {
      const diff = b.effectiveRating - a.effectiveRating
      if (diff !== 0) return diff
      return a.name.localeCompare(b.name)
    })
}

export function useCollectionStats() {
  return useLiveQuery(async () => {
    const entries = await db.collection.toArray()
    const owned = entries.filter(e => e.owned)
    const wishlist = entries.filter(e => !e.owned)
    const totalPerfumes = await db.perfumes.count()

    let avgRating = 0
    if (owned.length > 0) {
      const perfumeIds = owned.map(e => e.perfumeId)
      const perfumes = await db.perfumes.where('id').anyOf(perfumeIds).toArray()
      const ratings = perfumes.map(p => {
        const entry = owned.find(e => e.perfumeId === p.id)
        return entry?.personalRating ?? p.rating
      })
      avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
    }

    return {
      totalInCollection: owned.length,
      totalWishlist: wishlist.length,
      totalCatalog: totalPerfumes,
      avgRating: Math.round(avgRating * 10) / 10,
    }
  })
}

export function useSearchPerfumes(query: string): Perfume[] | undefined {
  return useLiveQuery(async () => {
    if (!query || query.length < 2) return []
    const lower = query.toLowerCase()
    const all = await db.perfumes.toArray()
    return all
      .filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower)
      )
      .slice(0, 20)
  }, [query])
}

// Collection CRUD operations
export async function addToCollection(perfumeId: string, owned: boolean = true): Promise<void> {
  const existing = await db.collection.get(perfumeId)
  if (existing) return

  await db.collection.put({
    perfumeId,
    addedAt: new Date().toISOString(),
    owned,
  })
}

export async function removeFromCollection(perfumeId: string): Promise<void> {
  await db.collection.delete(perfumeId)
}

export async function updateCollectionEntry(
  perfumeId: string,
  updates: Partial<CollectionEntry>
): Promise<void> {
  await db.collection.update(perfumeId, updates)
}

export async function addPerfumeToCatalog(perfume: Perfume): Promise<void> {
  await db.perfumes.put(perfume)
}
