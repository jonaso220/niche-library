import { db } from '@/db/database'
import type { Perfume, CollectionEntry } from '@/types/perfume'
import {
  fetchCloudPerfumes,
  fetchCloudCollection,
  cloudBulkWritePerfumes,
  cloudBulkWriteCollection,
  onCloudPerfumesChange,
  onCloudCollectionChange,
  saveUserProfile,
} from './firestore-service'
import { auth } from './config'

let unsubscribePerfumes: (() => void) | null = null
let unsubscribeCollection: (() => void) | null = null

export async function syncOnLogin(userId: string): Promise<void> {
  // Save user profile to Firestore
  const user = auth?.currentUser
  if (user) {
    await saveUserProfile(userId, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    }).catch(console.error)
  }

  // 1. Fetch cloud data
  const cloudPerfumes = await fetchCloudPerfumes(userId)
  const cloudCollection = await fetchCloudCollection(userId)

  // 2. Fetch local non-seed perfumes
  const localPerfumes = await db.perfumes
    .filter(p => p.dataSource !== 'seed')
    .toArray()
  const localCollection = await db.collection.toArray()

  // 3. Merge perfumes: union by ID, cloud wins on conflict
  const mergedPerfumesMap = new Map<string, Perfume>()
  for (const p of localPerfumes) mergedPerfumesMap.set(p.id, p)
  for (const p of cloudPerfumes) mergedPerfumesMap.set(p.id, p) // cloud overwrites
  const mergedPerfumes = Array.from(mergedPerfumesMap.values())

  // 4. Merge collection: union by perfumeId, most recent wins
  const mergedCollectionMap = new Map<string, CollectionEntry>()
  for (const e of localCollection) mergedCollectionMap.set(e.perfumeId, e)
  for (const e of cloudCollection) {
    const local = mergedCollectionMap.get(e.perfumeId)
    if (!local || e.addedAt >= local.addedAt) {
      mergedCollectionMap.set(e.perfumeId, e)
    }
  }
  const mergedCollection = Array.from(mergedCollectionMap.values())

  // 5. Write merged data to local Dexie
  if (mergedPerfumes.length > 0) {
    await db.perfumes.bulkPut(mergedPerfumes)
  }
  if (mergedCollection.length > 0) {
    await db.collection.bulkPut(mergedCollection)
  }

  // 6. Write merged data to cloud
  await cloudBulkWritePerfumes(userId, mergedPerfumes).catch(console.error)
  await cloudBulkWriteCollection(userId, mergedCollection).catch(console.error)

  // 7. Start real-time listeners
  startCloudListeners(userId)
}

function startCloudListeners(userId: string) {
  // Stop any existing listeners first
  stopCloudListeners()

  unsubscribePerfumes = onCloudPerfumesChange(userId, async (perfumes) => {
    if (perfumes.length > 0) {
      await db.perfumes.bulkPut(perfumes)
    }
  })

  unsubscribeCollection = onCloudCollectionChange(userId, async (entries) => {
    // Detect deletions: if entry is in Dexie but not in cloud, remove it
    const cloudIds = new Set(entries.map(e => e.perfumeId))
    const localEntries = await db.collection.toArray()
    const toDelete = localEntries.filter(e => !cloudIds.has(e.perfumeId))

    for (const e of toDelete) {
      await db.collection.delete(e.perfumeId)
    }

    if (entries.length > 0) {
      await db.collection.bulkPut(entries)
    }
  })
}

function stopCloudListeners() {
  unsubscribePerfumes?.()
  unsubscribeCollection?.()
  unsubscribePerfumes = null
  unsubscribeCollection = null
}

export function syncOnLogout() {
  stopCloudListeners()
  // Local data stays - user can continue in offline mode
}
