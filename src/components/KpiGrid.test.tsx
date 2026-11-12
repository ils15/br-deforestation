import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import KpiGrid from './KpiGrid'

describe('KpiGrid', () => {
  it('renders items', () => {
    render(<KpiGrid items={[{ label: 'A', value: 10, unit: 'km²' }]} />)
    expect(screen.getByTestId('kpi-grid')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders kpis prop fallback', () => {
    render(<KpiGrid kpis={[{ label: 'B', value: 20 }]} />)
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('renders empty and children', () => {
    render(<KpiGrid className="x" aria-label="K"><span>child</span></KpiGrid>)
    expect(screen.getByText('child')).toBeInTheDocument()
  })
})
