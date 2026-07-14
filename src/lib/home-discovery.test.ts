import { describe, expect, it } from 'vitest'
import type { Perfume, Season, ShelfPerfume } from '@/types/perfume'
import { buildHomeDiscovery, getSouthernSeason } from './home-discovery'

function makePerfume(id: string, season: Season = 'winter'): Perfume {
  return {
    id,
    name: `Perfume ${id}`,
    brand: 'Test',
    gender: 'unisex',
    concentration: 'EDP',
    rating: 4,
    longevity: 7,
    sillage: 7,
    notes: { top: [], middle: [], base: [] },
    accords: [{ name: 'woody', percentage: 70 }],
    seasonScores: [
      { season: 'spring', score: season === 'spring' ? 90 : 20 },
      { season: 'summer', score: season === 'summer' ? 90 : 20 },
      { season: 'fall', score: season === 'fall' ? 90 : 20 },
      { season: 'winter', score: season === 'winter' ? 90 : 20 },
    ],
    occasionScores: [],
    imageUrl: `https://example.com/${id}.jpg`,
    dataSource: 'seed',
  }
}

function inCollection(perfume: Perfume, owned: boolean): ShelfPerfume {
  return {
    ...perfume,
    collectionData: {
      perfumeId: perfume.id,
      addedAt: '2026-01-01T00:00:00.000Z',
      owned,
    },
    effectiveRating: perfume.rating,
  }
}

describe('getSouthernSeason', () => {
  it('uses Southern Hemisphere seasons', () => {
    expect(getSouthernSeason(new Date(2026, 0, 15))).toBe('summer')
    expect(getSouthernSeason(new Date(2026, 3, 15))).toBe('fall')
    expect(getSouthernSeason(new Date(2026, 6, 15))).toBe('winter')
    expect(getSouthernSeason(new Date(2026, 9, 15))).toBe('spring')
  })
})

describe('buildHomeDiscovery', () => {
  const catalog = Array.from({ length: 16 }, (_, index) =>
    makePerfume(`catalog-${String(index)}`, index < 12 ? 'winter' : 'summer'),
  )
  const owned = inCollection(makePerfume('owned'), true)
  const wished = inCollection(makePerfume('wished'), false)
  const date = new Date(2026, 6, 14)

  it('is stable for the same day and rotation', () => {
    const first = buildHomeDiscovery(catalog, [owned, wished], date)
    const second = buildHomeDiscovery(catalog, [owned, wished], date)
    expect(second.featured?.id).toBe(first.featured?.id)
    expect(second.discover.map(perfume => perfume.id)).toEqual(first.discover.map(perfume => perfume.id))
  })

  it('changes the featured perfume when the user rotates the selection', () => {
    const first = buildHomeDiscovery(catalog, [owned, wished], date, 0)
    const next = buildHomeDiscovery(catalog, [owned, wished], date, 1)
    expect(next.featured?.id).not.toBe(first.featured?.id)
  })

  it('does not repeat perfumes between homepage sections', () => {
    const result = buildHomeDiscovery(catalog, [owned, wished], date)
    const visibleIds = [
      result.featured?.id,
      ...result.discover.map(perfume => perfume.id),
      ...result.rediscover.map(perfume => perfume.id),
      ...result.wishlist.map(perfume => perfume.id),
    ].filter((id): id is string => Boolean(id))

    expect(new Set(visibleIds).size).toBe(visibleIds.length)
  })

  it('keeps collection items out of new discoveries', () => {
    const catalogWithOwned = [...catalog, owned]
    const result = buildHomeDiscovery(catalogWithOwned, [owned, wished], date)
    expect(result.discover.some(perfume => perfume.id === owned.id)).toBe(false)
    expect(result.rediscover.map(perfume => perfume.id)).toContain(owned.id)
    expect(result.wishlist.map(perfume => perfume.id)).toContain(wished.id)
  })
})
