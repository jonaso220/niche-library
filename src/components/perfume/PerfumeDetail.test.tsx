import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import type { Perfume } from '@/types/perfume'

const { updateCollectionEntry, wishlistEntry } = vi.hoisted(() => ({
  updateCollectionEntry: vi.fn(),
  wishlistEntry: {
    perfumeId: 'test-perfume-edp',
    addedAt: '2026-07-14T00:00:00.000Z',
    owned: false,
  },
}))

vi.mock('@/db/hooks', () => ({
  useCollectionEntry: () => wishlistEntry,
  updateCollectionEntry,
  addToCollection: vi.fn(),
  removeFromCollection: vi.fn(),
  updatePerfumeImage: vi.fn(),
  addPerfumeToCatalog: vi.fn(),
}))

import { PerfumeDetail } from './PerfumeDetail'

const perfume: Perfume = {
  id: 'test-perfume-edp',
  name: 'Perfume de prueba',
  brand: 'Marca',
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
}

describe('PerfumeDetail wishlist actions', () => {
  it('moves a wishlist entry directly into the owned collection', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <PerfumeDetail perfume={perfume} />
      </MemoryRouter>,
    )

    expect(screen.getByText('En lista de deseos')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ya lo tengo' }))

    expect(updateCollectionEntry).toHaveBeenCalledWith(perfume.id, {
      owned: true,
      previouslyOwned: false,
    })
  })
})
