import { db } from './database'
import { seedCatalog } from '@/data/seed-catalog'

const SEED_VERSION_KEY = 'niche-library-seed-v'
const CURRENT_SEED_VERSION = 2

export async function seedDatabaseIfNeeded(): Promise<void> {
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY)

  if (storedVersion === String(CURRENT_SEED_VERSION)) return

  // Always upsert seed data when version changes (e.g. new images, data corrections)
  await db.perfumes.bulkPut(seedCatalog)

  localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION))
}
