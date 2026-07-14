import { describe, expect, it } from 'vitest'
import {
  normalizeFragranceText,
  scoreFragranceMatch,
} from './fragrance-search'

const qaedAlFursan = {
  name: 'Qaed Al Fursan',
  brand: 'Lattafa Perfumes',
  concentration: 'Eau de Parfum',
  year: 2016,
}

describe('normalizeFragranceText', () => {
  it('removes accents and punctuation', () => {
    expect(normalizeFragranceText('Sauvage Extrême — Dior')).toBe('sauvage extreme dior')
  })

  it('normalizes common concentration aliases', () => {
    expect(normalizeFragranceText('Eau de Parfum')).toBe('edp')
    expect(normalizeFragranceText('agua de tocador')).toBe('edt')
  })
})

describe('scoreFragranceMatch', () => {
  it('matches brand and name regardless of order', () => {
    expect(scoreFragranceMatch('Lattafa Qaed Al Fursan', qaedAlFursan)).toBeGreaterThanOrEqual(0.94)
    expect(scoreFragranceMatch('Qaed Al Fursan Lattafa', qaedAlFursan)).toBeGreaterThanOrEqual(0.94)
  })

  it('matches concentration aliases', () => {
    expect(scoreFragranceMatch('Qaed Al Fursan EDP', qaedAlFursan)).toBeGreaterThanOrEqual(0.94)
  })

  it('tolerates a missing letter and an adjacent transposition', () => {
    expect(scoreFragranceMatch('Qaed Al Fursn', qaedAlFursan)).toBeGreaterThan(0.82)
    expect(scoreFragranceMatch('Qaed Al Frusan', qaedAlFursan)).toBeGreaterThan(0.82)
  })

  it('rejects unrelated fragrances', () => {
    expect(scoreFragranceMatch('Dior Sauvage', qaedAlFursan)).toBe(0)
  })
})
