import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Perfume } from '@/types/perfume'

// Hoisted mock state — shared across tests; counts calls per provider.
const mockState = vi.hoisted(() => ({
  fragellaCalls: 0,
  fragrancefinderCalls: 0,
  parfumoCalls: 0,
}))

vi.mock('@/api/fragella', () => ({
  fragellaProvider: {
    name: 'Fragella',
    isConfigured: () => true,
    search: vi.fn(() => {
      mockState.fragellaCalls++
      return Promise.resolve([])
    }),
  },
}))

vi.mock('@/api/fragrancefinder', () => ({
  fragranceFinderProvider: {
    name: 'FragranceFinder',
    isConfigured: () => false,
    search: vi.fn(() => {
      mockState.fragrancefinderCalls++
      return Promise.resolve([])
    }),
  },
}))

vi.mock('@/api/parfumo-provider', () => ({
  parfumoProvider: {
    name: 'Parfumo',
    isConfigured: () => true,
    search: vi.fn(() => {
      mockState.parfumoCalls++
      return Promise.resolve([])
    }),
  },
}))

import { richnessScore, deduplicateAndMerge, searchAllApis, __clearSearchCache } from './search-orchestrator'

function makePerfume(overrides: Partial<Perfume> = {}): Perfume {
  return {
    id: 'dior-sauvage-edp',
    name: 'Sauvage',
    brand: 'Dior',
    gender: 'masculino',
    concentration: 'EDP',
    rating: 0,
    longevity: 5,
    sillage: 5,
    notes: { top: [], middle: [], base: [] },
    accords: [],
    seasonScores: [],
    occasionScores: [],
    dataSource: 'manual',
    ...overrides,
  }
}

describe('richnessScore', () => {
  it('returns 0 for a perfume with only defaults', () => {
    expect(richnessScore(makePerfume())).toBe(0)
  })

  it('rewards rating, notes, accords and imagery', () => {
    const p = makePerfume({
      rating: 4.2,
      notes: {
        top: [{ name: 'bergamota' }],
        middle: [{ name: 'iris' }],
        base: [{ name: 'ámbar' }],
      },
      accords: [{ name: 'woody', percentage: 80 }],
      imageUrl: 'https://example.com/x.jpg',
      year: 2015,
      description: 'A fragrance.',
    })
    // rating(2) + notes top(2) + middle(2) + base(2) + accords(3) + image(1) + year(1) + desc(1) = 14
    expect(richnessScore(p)).toBe(14)
  })

  it('ranks a fuller perfume higher than a sparser one', () => {
    const sparse = makePerfume({ rating: 4.0 })
    const full = makePerfume({
      rating: 4.0,
      accords: [{ name: 'fresh', percentage: 60 }],
      notes: { top: [{ name: 'lemon' }], middle: [], base: [] },
    })
    expect(richnessScore(full)).toBeGreaterThan(richnessScore(sparse))
  })
})

describe('deduplicateAndMerge', () => {
  it('returns a single entry untouched', () => {
    const p = makePerfume({ rating: 4.5 })
    expect(deduplicateAndMerge([p])).toEqual([p])
  })

  it('keeps the richer duplicate (same slug)', () => {
    const poor = makePerfume({ id: 'a', rating: 0 })
    const rich = makePerfume({
      id: 'b',
      rating: 4.5,
      accords: [{ name: 'woody', percentage: 70 }],
    })
    const merged = deduplicateAndMerge([poor, rich])
    expect(merged).toHaveLength(1)
    expect(merged[0].rating).toBe(4.5)
    expect(merged[0].accords).toHaveLength(1)
  })

  it('fills missing imageUrl / description / year from the other duplicate', () => {
    const a = makePerfume({
      id: 'a',
      rating: 4.5,
      accords: [{ name: 'woody', percentage: 70 }], // richer
    })
    const b = makePerfume({
      id: 'b',
      imageUrl: 'https://example.com/x.jpg',
      description: 'Nice.',
      year: 2015,
    })
    const [merged] = deduplicateAndMerge([a, b])
    expect(merged.imageUrl).toBe('https://example.com/x.jpg')
    expect(merged.description).toBe('Nice.')
    expect(merged.year).toBe(2015)
  })

  it('keeps different slugs as separate entries', () => {
    const a = makePerfume({ brand: 'Dior', name: 'Sauvage' })
    const b = makePerfume({ brand: 'Creed', name: 'Aventus' })
    expect(deduplicateAndMerge([a, b])).toHaveLength(2)
  })
})

describe('searchAllApis cache', () => {
  beforeEach(() => {
    __clearSearchCache()
    mockState.fragellaCalls = 0
    mockState.fragrancefinderCalls = 0
    mockState.parfumoCalls = 0
  })

  it('dedupes concurrent identical queries', async () => {
    const [a, b] = await Promise.all([
      searchAllApis('sauvage'),
      searchAllApis('sauvage'),
    ])
    expect(a).toBe(b) // same promise resolved
    expect(mockState.parfumoCalls).toBe(1)
    expect(mockState.fragellaCalls).toBe(1)
  })

  it('reuses the cached result on repeat calls', async () => {
    await searchAllApis('sauvage')
    await searchAllApis('sauvage')
    expect(mockState.parfumoCalls).toBe(1)
    expect(mockState.fragellaCalls).toBe(1)
  })

  it('normalizes casing + surrounding whitespace', async () => {
    await searchAllApis('Sauvage')
    await searchAllApis('  sauvage  ')
    expect(mockState.parfumoCalls).toBe(1)
  })

  it('treats different queries as separate cache entries', async () => {
    await searchAllApis('sauvage')
    await searchAllApis('aventus')
    expect(mockState.parfumoCalls).toBe(2)
  })

  it('treats different limits as separate cache entries', async () => {
    await searchAllApis('sauvage', 10)
    await searchAllApis('sauvage', 20)
    expect(mockState.parfumoCalls).toBe(2)
  })
})
