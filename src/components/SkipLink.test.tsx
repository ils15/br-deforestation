import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import SkipLink from './SkipLink'

afterEach(() => cleanup())

describe('SkipLink', () => {
  it('renders a link to main content', () => {
    render(<SkipLink />)
    const link = screen.getByTestId('skip-link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#main-content')
    expect(link).toHaveTextContent(/skip to main content/i)
  })

  it('supports custom target and label', () => {
    render(<SkipLink targetId="content" label="Pular" />)
    expect(screen.getByTestId('skip-link')).toHaveAttribute('href', '#content')
    expect(screen.getByTestId('skip-link')).toHaveTextContent('Pular')
  })
})