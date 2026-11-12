import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import type { ReactNode } from 'react'
import MapaPanel from './MapaPanel'

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
}))

const geoJson = { features: [{ properties: { nome: 'Pará', sigla: 'PA' } }] }

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => geoJson }))
})
afterEach(() => cleanup())

describe('MapaPanel', () => {
  it('renders amazonia map by default', async () => {
    render(<MapaPanel filters={{ yearMin: 2006, yearMax: 2026, biome: 'Todos', states: [] }} />)
    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument())
    expect(screen.getByText(/Amazônia — 2026/i)).toBeInTheDocument()
  })

  it('renders cerrado map when biome is Cerrado', async () => {
    render(<MapaPanel filters={{ yearMin: 2006, yearMax: 2025, biome: 'Cerrado', states: [] }} />)
    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument())
    expect(screen.getByText(/Cerrado — 2025/i)).toBeInTheDocument()
  })

  it('renders matopiba as cerrado', async () => {
    render(<MapaPanel filters={{ yearMin: 2006, yearMax: 0, biome: 'MATOPIBA', states: ['Pará'] }} />)
    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument())
    expect(screen.getByText(/Cerrado — 2026/i)).toBeInTheDocument()
  })

  it('filters selected states', async () => {
    render(<MapaPanel filters={{ yearMin: 2006, yearMax: 2026, biome: 'Amazônia', states: ['Pará'] }} />)
    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument())
  })
})
