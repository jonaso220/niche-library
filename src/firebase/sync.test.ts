import { describe, expect, it, vi } from 'vitest'
import type { Perfume, CollectionEntry } from '@/types/perfume'

// Stub Dexie + firestore-service + imports that touch IndexedDB so we can
// import the pure merge helpers without triggering side effects.
vi.mock('@/db/database', () => ({ db: {} }))
vi.mock('@/db/seed', () => ({ seedDatabaseIfNeeded: vi.fn() }))
vi.mock('@/db/fragrantica-import', () => ({
  importFragranticaCollection: vi.fn(),
  isFragranticaImportDone: vi.fn(() => true),
  ensureScoresInferred: vi.fn(() => Promise.resolve(0)),
}))
vi.mock('@/db/fragrantica-enrichment', () => ({ applyFragranticaEnrichment: vi.fn() }))
vi.mock('./firestore-service', () => ({
  fetchCloudPerfumes: vi.fn(),
  fetchCloudCollection: vi.fn(),
  cloudBulkWritePerfumes: vi.fn(),
  cloudBulkWriteCollection: vi.fn(),
  onCloudPerfumesChange: vi.fn(),
  onCloudCollectionChange: vi.fn(),
  saveUserProfile: vi.fn(),
}))
vi.mock('./config', () => ({ auth: null }))

import { mergePerfumes, mergeCollection } from './sync'

function makePerfume(id: string, overrides: Partial<Perfume> = {}): Perfume {
  return {
    id,
    name: id,
    brand: 'Brand',
    gender: 'unisex',
    concentration: 'EDP',
    rating: 4,
    longevity: 6,
    sillage: 6,
    notes: { top: [], middle: [], base: [] },
    accords: [],
    seasonScores: [],
    occasionScores: [],
    dataSource: 'manual',
    ...overrides,
  }
}

function makeEntry(perfumeId: string, addedAt: string, overrides: Partial<CollectionEntry> = {}): CollectionEntry {
  return {
    perfumeId,
    addedAt,
    owned: true,
    ...overrides,
  }
}

describe('mergePerfumes', () => {
  it('returns only local when cloud is empty', () => {
    const local = [makePerfume('a'), makePerfume('b')]
    expect(mergePerfumes(local, [])).toEqual(local)
  })

  it('returns only cloud when local is empty', () => {
    const cloud = [makePerfume('a')]
    expect(mergePerfumes([], cloud)).toEqual(cloud)
  })

  it('unions local + cloud when IDs are disjoint', () => {
    const local = [makePerfume('a')]
    const cloud = [makePerfume('b')]
    const merged = mergePerfumes(local, cloud)
    expect(merged).toHaveLength(2)
    expect(merged.map(p => p.id).sort()).toEqual(['a', 'b'])
  })

  it('cloud overrides local on ID conflicts', () => {
    const local = [makePerfume('a', { rating: 1 })]
    const cloud = [makePerfume('a', { rating: 5 })]
    const [merged] = mergePerfumes(local, cloud)
    expect(merged.rating).toBe(5)
  })

  it('preserves local entries not present in cloud (offline adds survive login)', () => {
    const local = [makePerfume('local-only'), makePerfume('shared', { rating: 2 })]
    const cloud = [makePerfume('shared', { rating: 4 })]
    const merged = mergePerfumes(local, cloud)
    expect(merged).toHaveLength(2)
    expect(merged.find(p => p.id === 'local-only')).toBeDefined()
    expect(merged.find(p => p.id === 'shared')?.rating).toBe(4)
  })
})

describe('mergeCollection', () => {
  it('unions disjoint entries', () => {
    const local = [makeEntry('a', '2025-01-01')]
    const cloud = [makeEntry('b', '2025-01-02')]
    expect(mergeCollection(local, cloud)).toHaveLength(2)
  })

  it('keeps the most recent on conflicts (cloud newer)', () => {
    const local = [makeEntry('x', '2025-01-01', { owned: true })]
    const cloud = [makeEntry('x', '2025-01-10', { owned: false })]
    const [merged] = mergeCollection(local, cloud)
    expect(merged.addedAt).toBe('2025-01-10')
    expect(merged.owned).toBe(false)
  })

  it('keeps the most recent on conflicts (local newer)', () => {
    const local = [makeEntry('x', '2025-02-01', { personalRating: 5 })]
    const cloud = [makeEntry('x', '2025-01-01', { personalRating: 2 })]
    const [merged] = mergeCollection(local, cloud)
    expect(merged.addedAt).toBe('2025-02-01')
    expect(merged.personalRating).toBe(5)
  })

  it('ties go to cloud (overwrite, matches current behavior)', () => {
    const local = [makeEntry('x', '2025-01-01', { personalNotes: 'local' })]
    const cloud = [makeEntry('x', '2025-01-01', { personalNotes: 'cloud' })]
    const [merged] = mergeCollection(local, cloud)
    expect(merged.personalNotes).toBe('cloud')
  })

  it('preserves local-only entries (multi-device: add on A, login on A keeps it)', () => {
    const local = [makeEntry('only-local', '2025-03-01')]
    const cloud = [makeEntry('only-cloud', '2025-02-01')]
    const merged = mergeCollection(local, cloud)
    expect(merged).toHaveLength(2)
    expect(merged.map(e => e.perfumeId).sort()).toEqual(['only-cloud', 'only-local'])
  })
})
