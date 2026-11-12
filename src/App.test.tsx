import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import type { ReactNode } from 'react'
import App from './App'

vi.mock('leaflet/dist/leaflet.css', () => ({}))
vi.mock('leaflet', () => ({
  default: {},
}))
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <div data-testid="map-container" aria-label={props['aria-label'] as string}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  GeoJSON: ({ data }: { data?: { features?: unknown[] } }) => (
    <div data-testid="geojson">{data?.features?.length ?? 0}</div>
  ),
  useMap: () => ({ invalidateSize: vi.fn(), getContainer: () => document.createElement('div') }),
}))

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
    for (const name of ['Amazônia', 'Cerrado', 'MATOPIBA', 'Comparativo']) {
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

  it('renders map in main view', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument())
  })
})