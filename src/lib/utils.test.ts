import { describe, expect, it } from 'vitest'
import { generateSlug, formatUYU, cn } from './utils'

describe('generateSlug', () => {
  it('normalizes brand + name + concentration to a kebab-case id', () => {
    expect(generateSlug('Dior', 'Sauvage', 'EDP')).toBe('dior-sauvage-edp')
  })

  it('strips accents and punctuation to ASCII kebab', () => {
    expect(generateSlug('Guerlain', "L'Homme Idéal", 'EDT')).toBe('guerlain-l-homme-id-al-edt')
  })

  it('ignores falsy concentration', () => {
    expect(generateSlug('Chanel', 'Bleu')).toBe('chanel-bleu')
  })

  it('collapses repeated separators', () => {
    expect(generateSlug('  Dior  ', '--Sauvage--', 'EDP')).toBe('dior-sauvage-edp')
  })

  it('is stable — same input yields same slug', () => {
    expect(generateSlug('Creed', 'Aventus', 'EDP')).toBe(generateSlug('Creed', 'Aventus', 'EDP'))
  })
})

describe('formatUYU', () => {
  it('formats without decimals and with UYU currency', () => {
    const out = formatUYU(1234)
    expect(out).toMatch(/1\.234/)
    expect(out).toMatch(/\$/)
  })

  it('formats zero', () => {
    expect(formatUYU(0)).toMatch(/0/)
  })
})

describe('cn', () => {
  it('merges classes and dedupes conflicting tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('handles conditionals', () => {
    const show = false as boolean
    expect(cn('a', show && 'b', 'c')).toBe('a c')
  })
})
