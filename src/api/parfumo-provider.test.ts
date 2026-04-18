import { describe, expect, it, vi } from 'vitest'
import type { ParfumoEntry } from '@/db/database'

// parfumo-loader imports @/db/database which initializes Dexie — stub that.
vi.mock('@/db/database', () => ({ db: {} }))
vi.mock('@/db/parfumo-loader', () => ({
  searchParfumo: vi.fn(),
  isParfumoLoaded: () => false,
}))

import { transformToLocal } from './parfumo-provider'

function makeEntry(overrides: Partial<ParfumoEntry> = {}): ParfumoEntry {
  return {
    id: 'dior-sauvage-edp',
    name: 'Sauvage',
    brand: 'Dior',
    year: 2015,
    concentration: 'EDP',
    rating: 8, // 0-10 scale
    accords: 'woody,fresh,aromatic,amber',
    topNotes: 'bergamota, pimienta',
    midNotes: 'ambroxan, lavanda',
    baseNotes: 'cedro, labdanum',
    imageUrl: 'https://example.com/sauvage.jpg',
    ...overrides,
  }
}

describe('transformToLocal (parfumo → Perfume)', () => {
  it('maps basic fields', () => {
    const p = transformToLocal(makeEntry())
    expect(p.name).toBe('Sauvage')
    expect(p.brand).toBe('Dior')
    expect(p.year).toBe(2015)
    expect(p.concentration).toBe('EDP')
  })

  it('converts Parfumo 0-10 rating to internal 0-5 scale', () => {
    expect(transformToLocal(makeEntry({ rating: 10 })).rating).toBe(5)
    expect(transformToLocal(makeEntry({ rating: 8 })).rating).toBe(4)
    expect(transformToLocal(makeEntry({ rating: 0 })).rating).toBe(0)
  })

  it('parses note strings into name objects', () => {
    const p = transformToLocal(makeEntry({
      topNotes: 'bergamota, limón, pimienta',
      midNotes: '',
      baseNotes: 'cedro',
    }))
    expect(p.notes.top).toEqual([
      { name: 'bergamota' },
      { name: 'limón' },
      { name: 'pimienta' },
    ])
    expect(p.notes.middle).toEqual([])
    expect(p.notes.base).toEqual([{ name: 'cedro' }])
  })

  it('assigns descending accord percentages', () => {
    const p = transformToLocal(makeEntry({ accords: 'woody,fresh,amber,sweet' }))
    expect(p.accords).toHaveLength(4)
    expect(p.accords[0].name).toBe('woody')
    expect(p.accords[0].percentage).toBeGreaterThan(p.accords[3].percentage)
  })

  it('handles empty accords / notes gracefully', () => {
    const p = transformToLocal(makeEntry({ accords: '', topNotes: '', midNotes: '', baseNotes: '' }))
    expect(p.accords).toEqual([])
    expect(p.notes.top).toEqual([])
    expect(p.notes.middle).toEqual([])
    expect(p.notes.base).toEqual([])
  })

  it('treats year of 0 as undefined', () => {
    const p = transformToLocal(makeEntry({ year: 0 }))
    expect(p.year).toBeUndefined()
  })

  it('treats empty imageUrl as undefined', () => {
    const p = transformToLocal(makeEntry({ imageUrl: '' }))
    expect(p.imageUrl).toBeUndefined()
  })

  it('infers masculine gender from "pour homme" markers', () => {
    expect(transformToLocal(makeEntry({ name: 'Eau Sauvage Pour Homme', brand: 'Dior' })).gender).toBe('masculino')
  })

  it('infers feminine gender from "pour femme" markers', () => {
    expect(transformToLocal(makeEntry({ name: 'J\'adore Pour Femme', brand: 'Dior' })).gender).toBe('femenino')
  })

  it('defaults to unisex when no gender markers present', () => {
    expect(transformToLocal(makeEntry({ name: 'Aventus', brand: 'Creed' })).gender).toBe('unisex')
  })

  it('applies image corrections for known bad entries', () => {
    const p = transformToLocal(makeEntry({
      name: 'Boss Bottled Absolute',
      brand: 'Hugo Boss',
      concentration: '',
      imageUrl: 'https://wrong-url.example/x.jpg',
    }))
    expect(p.imageUrl).toBe('https://fimgs.net/mdimg/perfume/375x500.96246.jpg')
  })
})
