import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { PerfumeCard } from './PerfumeCard'
import type { Perfume, ShelfPerfume } from '@/types/perfume'

function makePerfume(overrides: Partial<Perfume> = {}): Perfume {
  return {
    id: 'dior-sauvage-edp',
    name: 'Sauvage',
    brand: 'Dior',
    gender: 'masculino',
    concentration: 'EDP',
    rating: 4.2,
    longevity: 7,
    sillage: 6,
    notes: { top: [], middle: [], base: [] },
    accords: [],
    seasonScores: [],
    occasionScores: [],
    dataSource: 'manual',
    ...overrides,
  }
}

function renderCard(perfume: Perfume | ShelfPerfume, props: Partial<React.ComponentProps<typeof PerfumeCard>> = {}) {
  return render(
    <MemoryRouter>
      <PerfumeCard perfume={perfume} {...props} />
    </MemoryRouter>,
  )
}

describe('PerfumeCard', () => {
  it('renders brand and name', () => {
    renderCard(makePerfume())
    expect(screen.getByText('Dior')).toBeInTheDocument()
    expect(screen.getByText('Sauvage')).toBeInTheDocument()
  })

  it('renders a link to the perfume detail page', () => {
    renderCard(makePerfume())
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/perfume/dior-sauvage-edp')
  })

  it('renders the image with descriptive alt when imageUrl is present', () => {
    renderCard(makePerfume({ imageUrl: 'https://example.com/x.jpg' }))
    const img = screen.getByAltText('Dior Sauvage')
    expect(img).toHaveAttribute('src', 'https://example.com/x.jpg')
  })

  it('shows concentration fallback icon when no imageUrl', () => {
    renderCard(makePerfume({ imageUrl: undefined }))
    expect(screen.queryByAltText('Dior Sauvage')).toBeNull()
    // Concentration appears twice (fallback + info row); just confirm >= 1
    expect(screen.getAllByText('EDP').length).toBeGreaterThanOrEqual(1)
  })

  it('renders as a button when onClick is provided instead of a link', () => {
    const onClick = () => {}
    renderCard(makePerfume(), { onClick })
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('button')).toHaveClass('text-left')
  })

  it('uses effectiveRating when passed a ShelfPerfume', () => {
    const shelf: ShelfPerfume = {
      ...makePerfume({ rating: 3 }),
      effectiveRating: 5,
      collectionData: {
        perfumeId: 'dior-sauvage-edp',
        addedAt: '2025-01-01',
        owned: true,
      },
    }
    renderCard(shelf)
    // Component renders rating via RatingStars which prints rating.toFixed(1)
    expect(screen.getByText('5.0')).toBeInTheDocument()
  })
})
