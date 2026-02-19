import {
  collection, doc, getDocs, setDoc, deleteDoc, updateDoc,
  onSnapshot, writeBatch
} from 'firebase/firestore'
import { firestore } from './config'
import type { Perfume, CollectionEntry } from '@/types/perfume'

function userPerfumesRef(userId: string) {
  return collection(firestore!, 'users', userId, 'perfumes')
}

function userCollectionRef(userId: string) {
  return collection(firestore!, 'users', userId, 'collection')
}

// ===================== READS =====================

export async function fetchCloudPerfumes(userId: string): Promise<Perfume[]> {
  if (!firestore) return []
  const snapshot = await getDocs(userPerfumesRef(userId))
  return snapshot.docs.map(d => d.data() as Perfume)
}

export async function fetchCloudCollection(userId: string): Promise<CollectionEntry[]> {
  if (!firestore) return []
  const snapshot = await getDocs(userCollectionRef(userId))
  return snapshot.docs.map(d => d.data() as CollectionEntry)
}

// ===================== REAL-TIME LISTENERS =====================

export function onCloudPerfumesChange(
  userId: string,
  callback: (perfumes: Perfume[]) => void
): () => void {
  if (!firestore) return () => {}
  return onSnapshot(userPerfumesRef(userId), (snapshot) => {
    const perfumes = snapshot.docs.map(d => d.data() as Perfume)
    callback(perfumes)
  })
}

export function onCloudCollectionChange(
  userId: string,
  callback: (entries: CollectionEntry[]) => void
): () => void {
  if (!firestore) return () => {}
  return onSnapshot(userCollectionRef(userId), (snapshot) => {
    const entries = snapshot.docs.map(d => d.data() as CollectionEntry)
    callback(entries)
  })
}

// ===================== WRITES =====================

export async function cloudAddPerfume(userId: string, perfume: Perfume): Promise<void> {
  if (!firestore) return
  const ref = doc(firestore, 'users', userId, 'perfumes', perfume.id)
  await setDoc(ref, perfumeToPlain(perfume))
}

export async function cloudAddToCollection(userId: string, entry: CollectionEntry): Promise<void> {
  if (!firestore) return
  const ref = doc(firestore, 'users', userId, 'collection', entry.perfumeId)
  await setDoc(ref, { ...entry })
}

export async function cloudRemoveFromCollection(userId: string, perfumeId: string): Promise<void> {
  if (!firestore) return
  const ref = doc(firestore, 'users', userId, 'collection', perfumeId)
  await deleteDoc(ref)
}

export async function cloudUpdateCollectionEntry(
  userId: string,
  perfumeId: string,
  updates: Partial<CollectionEntry>
): Promise<void> {
  if (!firestore) return
  const ref = doc(firestore, 'users', userId, 'collection', perfumeId)
  await updateDoc(ref, updates)
}

// ===================== BULK SYNC =====================

export async function cloudBulkWritePerfumes(userId: string, perfumes: Perfume[]): Promise<void> {
  if (!firestore || perfumes.length === 0) return

  // Firestore batches max 500 operations
  const batchSize = 450
  for (let i = 0; i < perfumes.length; i += batchSize) {
    const batch = writeBatch(firestore)
    const chunk = perfumes.slice(i, i + batchSize)
    for (const perfume of chunk) {
      const ref = doc(firestore, 'users', userId, 'perfumes', perfume.id)
      batch.set(ref, perfumeToPlain(perfume))
    }
    await batch.commit()
  }
}

export async function cloudBulkWriteCollection(userId: string, entries: CollectionEntry[]): Promise<void> {
  if (!firestore || entries.length === 0) return

  const batchSize = 450
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = writeBatch(firestore)
    const chunk = entries.slice(i, i + batchSize)
    for (const entry of chunk) {
      const ref = doc(firestore, 'users', userId, 'collection', entry.perfumeId)
      batch.set(ref, { ...entry })
    }
    await batch.commit()
  }
}

// ===================== USER PROFILE =====================

export async function saveUserProfile(userId: string, profile: {
  displayName: string | null
  email: string | null
  photoURL: string | null
}): Promise<void> {
  if (!firestore) return
  const ref = doc(firestore, 'users', userId)
  await setDoc(ref, { ...profile, lastSyncAt: new Date().toISOString() }, { merge: true })
}

// ===================== HELPERS =====================

// Convert Perfume to a plain object for Firestore (remove undefined values)
function perfumeToPlain(perfume: Perfume): Record<string, unknown> {
  const plain: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(perfume)) {
    if (value !== undefined) {
      plain[key] = value
    }
  }
  return plain
}
