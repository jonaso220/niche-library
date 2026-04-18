import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RatingStars } from './RatingStars'

describe('RatingStars', () => {
  it('renders the numeric rating with one decimal', () => {
    render(<RatingStars rating={4.2} />)
    expect(screen.getByText('4.2')).toBeInTheDocument()
  })

  it('renders maxRating star buttons (default 5)', () => {
    render(<RatingStars rating={3} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('respects a custom maxRating', () => {
    render(<RatingStars rating={2} maxRating={10} />)
    expect(screen.getAllByRole('button')).toHaveLength(10)
  })

  it('disables buttons when not interactive', () => {
    render(<RatingStars rating={3} />)
    for (const btn of screen.getAllByRole('button')) {
      expect(btn).toBeDisabled()
    }
  })

  it('calls onChange with the clicked star index when interactive', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RatingStars rating={0} interactive onChange={onChange} />)
    await user.click(screen.getAllByRole('button')[3])
    expect(onChange).toHaveBeenCalledWith(4)
  })
})
