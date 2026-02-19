import { db } from './database'
import { seedCatalog } from '@/data/seed-catalog'

const SEED_VERSION_KEY = 'niche-library-seed-v'
const CURRENT_SEED_VERSION = 1

export async function seedDatabaseIfNeeded(): Promise<void> {
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY)

  if (storedVersion === String(CURRENT_SEED_VERSION)) return

  const count = await db.perfumes.count()
  if (count === 0) {
    await db.perfumes.bulkPut(seedCatalog)
  }

  localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION))
}
