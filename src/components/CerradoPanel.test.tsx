import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import CerradoPanel from './CerradoPanel'

describe('CerradoPanel', () => {
  it('renders charts', () => {
    render(<CerradoPanel filters={{ yearMin: 2006, yearMax: 2026, biome: 'Todos', states: ['Bahia'] }} />)
    expect(screen.getByText(/Desmatamento — Cerrado/i)).toBeInTheDocument()
  })
})
