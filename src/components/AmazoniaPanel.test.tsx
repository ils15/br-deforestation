import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import AmazoniaPanel from './AmazoniaPanel'

describe('AmazoniaPanel', () => {
  it('renders charts', () => {
    render(<AmazoniaPanel filters={{ yearMin: 2006, yearMax: 2026, biome: 'Todos', states: ['Pará'] }} />)
    expect(screen.getByText(/Desmatamento — Amazônia/i)).toBeInTheDocument()
  })
})
