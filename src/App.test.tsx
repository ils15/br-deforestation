import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ features: [] }) }))
})
afterEach(() => {
  cleanup()
})

describe('App tabbed shell', () => {
  it('renders tablist with tabs', () => {
    render(<App />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    for (const name of ['Amazônia', 'Cerrado', 'MATOPIBA', 'Comparativo', 'Mapa']) {
      expect(screen.getByRole('tab', { name })).toBeInTheDocument()
    }
  })

  it('switches tab panels on click', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Comparativo' }))
    expect(screen.getByText(/Variação Ano a Ano/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'MATOPIBA' }))
    expect(screen.getByText(/MATOPIBA — Estados/i)).toBeInTheDocument()
  })

  it('supports arrow-key navigation', () => {
    render(<App />)
    const first = screen.getByRole('tab', { name: 'Amazônia' })
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Cerrado' })).toHaveFocus()
  })

  it('renders KPI grid', () => {
    render(<App />)
    expect(screen.getByTestId('kpi-grid')).toBeInTheDocument()
  })
})