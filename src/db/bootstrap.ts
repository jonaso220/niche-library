import { seedDatabaseIfNeeded } from './seed'
import { applyFragranticaEnrichment } from './fragrantica-enrichment'
import { ensureScoresInferred } from './fragrantica-import'

let initialization: Promise<void> | null = null

/** Initialize public/local catalog data independently from authentication. */
export function initializeLocalDatabase(): Promise<void> {
  if (!initialization) {
    initialization = (async () => {
      await seedDatabaseIfNeeded()
      await applyFragranticaEnrichment()
      await ensureScoresInferred()
    })().catch(error => {
      initialization = null
      throw error
    })
  }
  return initialization
}

export function resetLocalInitialization(): void {
  initialization = null
}
