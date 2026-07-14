import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './database'
import type { Perfume, CollectionEntry, ShelfPerfume } from '@/types/perfume'
import type { ShelfType } from '@/types/shelves'
import { getShelfDefinition } from '@/lib/constants'
import { getCurrentUserId } from '@/firebase/auth-state'
import * as cloud from '@/firebase/firestore-service'
import { isParfumoLoaded } from './parfumo-loader'
import { parfumoProvider } from '@/api/parfumo-provider'

// ===================== QUERY HOOKS (unchanged - read from Dexie) =====================

export function useAllPerfumes(): Perfume[] | undefined {
  return useLiveQuery(() => db.perfumes.toArray())
}

export function usePerfumeById(id: string): Perfume | undefined {
  return useLiveQuery(() => db.perfumes.get(id), [id])
}

export function useCollection(): CollectionEntry[] | undefined {
  return useLiveQuery(() => db.collection.filter(entry => !entry.deletedAt).toArray())
}

export function useCollectionEntry(perfumeId: string): CollectionEntry | undefined {
  return useLiveQuery(async () => {
    const entry = await db.collection.get(perfumeId)
    return entry?.deletedAt ? undefined : entry
  }, [perfumeId])
}

export function useCollectionPerfumes(): ShelfPerfume[] | undefined {
  return useLiveQuery(async () => {
    const entries = await db.collection.filter(entry => !entry.deletedAt).toArray()
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

  const sorted = all
    .filter(shelf.filterFn)
    .sort((a, b) => {
      const diff = b.effectiveRating - a.effectiveRating
      if (diff !== 0) return diff
      return a.name.localeCompare(b.name)
    })

  return shelf.limit ? sorted.slice(0, shelf.limit) : sorted
}

export function useCollectionStats() {
  return useLiveQuery(async () => {
    const entries = await db.collection.filter(entry => !entry.deletedAt).toArray()
    const owned = entries.filter(e => e.owned)
    const wishlist = entries.filter(e => !e.owned && !e.previouslyOwned)
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

    // Search local collection perfumes
    const all = await db.perfumes.toArray()
    const localResults = all
      .filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower)
      )
      .slice(0, 20)

    // Also search Parfumo dataset if loaded
    if (!isParfumoLoaded()) return localResults

    const parfumoResults = await parfumoProvider.search(query, 20)

    // Merge: local first, then Parfumo results not already in local
    const localIds = new Set(localResults.map(p => p.id))
    const extra = parfumoResults.filter(p => !localIds.has(p.id))

    return [...localResults, ...extra].slice(0, 20)
  }, [query])
}

// ===================== MUTATION FUNCTIONS (dual-write: Dexie + Firestore) =====================

export async function addToCollection(perfumeId: string, owned: boolean = true): Promise<void> {
  const existing = await db.collection.get(perfumeId)
  if (existing && !existing.deletedAt) return

  const now = new Date().toISOString()
  const entry: CollectionEntry = {
    perfumeId,
    addedAt: existing?.addedAt ?? now,
    owned,
    updatedAt: now,
  }

  // Local write (instant, triggers useLiveQuery)
  await db.collection.put(entry)

  // Cloud write (fire-and-forget)
  const userId = getCurrentUserId()
  if (userId) {
    cloud.cloudAddToCollection(userId, entry).catch(console.error)
  }
}

export async function removeFromCollection(perfumeId: string): Promise<void> {
  const existing = await db.collection.get(perfumeId)
  if (!existing) return
  const now = new Date().toISOString()
  const tombstone: CollectionEntry = { ...existing, deletedAt: now, updatedAt: now }
  await db.collection.put(tombstone)

  // Cloud write
  const userId = getCurrentUserId()
  if (userId) {
    cloud.cloudAddToCollection(userId, tombstone).catch(console.error)
  }
}

export async function updateCollectionEntry(
  perfumeId: string,
  updates: Partial<CollectionEntry>
): Promise<void> {
  const timestampedUpdates = { ...updates, updatedAt: new Date().toISOString() }
  // Local write
  await db.collection.update(perfumeId, timestampedUpdates)

  // Cloud write
  const userId = getCurrentUserId()
  if (userId) {
    cloud.cloudUpdateCollectionEntry(userId, perfumeId, timestampedUpdates).catch(console.error)
  }
}

export async function updatePerfumeImage(perfume: Perfume, imageUrl: string): Promise<void> {
  const updated = { ...perfume, imageUrl, updatedAt: new Date().toISOString() }

  // Local write
  await db.perfumes.put(updated)

  // Cloud write
  const userId = getCurrentUserId()
  if (userId) {
    cloud.cloudAddPerfume(userId, updated).catch(console.error)
  }
}

export async function addPerfumeToCatalog(perfume: Perfume): Promise<void> {
  const timestamped = { ...perfume, updatedAt: perfume.updatedAt ?? new Date().toISOString() }
  // Local write
  await db.perfumes.put(timestamped)

  // Cloud write (only non-seed perfumes)
  if (perfume.dataSource !== 'seed') {
    const userId = getCurrentUserId()
    if (userId) {
      cloud.cloudAddPerfume(userId, timestamped).catch(console.error)
    }
  }
}
