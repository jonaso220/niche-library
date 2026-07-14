import { describe, expect, it } from 'vitest'
import { sanitizeNotes, sanitizeParfumoName } from './parfumo-loader'

describe('Parfumo dataset sanitization', () => {
  it('removes repeated brand, year and concentration suffixes', () => {
    expect(sanitizeParfumoName(
      'Givenchy Gentleman Givenchy 1974 After Shave',
      'Givenchy',
      1974,
      'After Shave',
    )).toBe('Givenchy Gentleman')
  })

  it('removes known corrupted note tokens without touching valid notes', () => {
    expect(sanitizeNotes('Bergamot, Rotten Onion, Cedar, Flibtix')).toBe('Bergamot, Cedar')
  })
})
