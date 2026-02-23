import { db } from '@/db/database'
import type { Perfume, CollectionEntry } from '@/types/perfume'
import { seedDatabaseIfNeeded } from '@/db/seed'
import { importFragranticaCollection, isFragranticaImportDone, ensureScoresInferred } from '@/db/fragrantica-import'
import { applyFragranticaEnrichment } from '@/db/fragrantica-enrichment'
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

  // 0. Initialize local data (seed catalog + Fragrantica import + enrichment)
  await seedDatabaseIfNeeded()
  if (!isFragranticaImportDone()) {
    await importFragranticaCollection()
  }
  await applyFragranticaEnrichment()
  await ensureScoresInferred()

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

  // 5b. Re-apply Fragrantica enrichment data that may have been overwritten by cloud
  await applyFragranticaEnrichment()

  // 5c. Infer season/occasion scores for perfumes with accords but default scores
  // Must run AFTER cloud merge to fix scores that were overwritten by cloud data
  const scoresFixed = await ensureScoresInferred()

  // 6. Write merged data to cloud (includes newly inferred scores)
  const finalPerfumes = scoresFixed > 0
    ? await db.perfumes.filter(p => p.dataSource !== 'seed').toArray()
    : mergedPerfumes
  await cloudBulkWritePerfumes(userId, finalPerfumes).catch(console.error)
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
      // Re-apply enrichment and re-infer scores after cloud overwrites
      await applyFragranticaEnrichment()
      await ensureScoresInferred()
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

export async function syncOnLogout() {
  stopCloudListeners()
  // Clear local data so the device is clean for another user
  await db.perfumes.clear()
  await db.collection.clear()
}
