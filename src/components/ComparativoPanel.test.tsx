import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import ComparativoPanel from './ComparativoPanel'

afterEach(() => cleanup())

describe('ComparativoPanel', () => {
  it('renders analytics charts', () => {
    render(<ComparativoPanel filters={{ yearMin: 2006, yearMax: 2026, biome: 'Todos', states: [] }} />)
    expect(screen.getByText(/Variação Ano a Ano/i)).toBeInTheDocument()
    expect(screen.getByText(/Média Móvel/i)).toBeInTheDocument()
    expect(screen.getByText(/Projeção/i)).toBeInTheDocument()
    expect(screen.getByText(/Correlação/i)).toBeInTheDocument()
  })

  it('changes forecast horizon', () => {
    render(<ComparativoPanel filters={{ yearMin: 2006, yearMax: 2026, biome: 'Todos', states: [] }} />)
    fireEvent.change(screen.getByTestId('horizon-select'), { target: { value: '5' } })
    expect(screen.getByTestId('horizon-select')).toHaveValue('5')
  })

  it('renders empty state when no data', () => {
    render(<ComparativoPanel filters={{ yearMin: 2030, yearMax: 2026, biome: 'Todos', states: [] }} />)
    expect(screen.getAllByTestId('empty-state').length).toBeGreaterThan(0)
  })
})