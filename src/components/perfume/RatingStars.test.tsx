import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RatingStars } from './RatingStars'

describe('RatingStars', () => {
  it('renders the numeric rating with one decimal', () => {
    render(<RatingStars rating={4.2} />)
    expect(screen.getByText('4.2')).toBeInTheDocument()
  })

  it('renders a single accessible rating when not interactive', () => {
    render(<RatingStars rating={3} />)
    expect(screen.getByRole('img', { name: '3.0 de 5 estrellas' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('respects a custom maxRating', () => {
    render(<RatingStars rating={2} maxRating={10} />)
    expect(screen.getByRole('img', { name: '2.0 de 10 estrellas' })).toBeInTheDocument()
  })

  it('labels every choice when interactive', () => {
    render(<RatingStars rating={3} interactive />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
    expect(screen.getByRole('button', { name: '4 de 5 estrellas' })).toBeInTheDocument()
  })

  it('calls onChange with the clicked star index when interactive', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RatingStars rating={0} interactive onChange={onChange} />)
    await user.click(screen.getAllByRole('button')[3])
    expect(onChange).toHaveBeenCalledWith(4)
  })
})
