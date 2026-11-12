import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import MatopibaPanel from './MatopibaPanel'

describe('MatopibaPanel', () => {
  it('renders charts', () => {
    render(<MatopibaPanel filters={{ yearMin: 2006, yearMax: 2026, biome: 'Todos', states: ['Bahia'] }} />)
    expect(screen.getByText(/MATOPIBA/i)).toBeInTheDocument()
  })

  it('renders empty state when no states', () => {
    render(<MatopibaPanel filters={{ yearMin: 2006, yearMax: 2026, biome: 'Todos', states: ['Pará'] }} />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })
})
