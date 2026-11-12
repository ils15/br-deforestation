import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import type { ReactNode } from 'react'
import DeforestationMap from './DeforestationMap'
import { escapeHtml } from '../lib/mapHelpers'

const layers: Array<{ bindTooltip: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn> }> = []

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
  GeoJSON: ({ data, style, onEachFeature }: { data?: { features?: unknown[] }; style?: (f: unknown) => unknown; onEachFeature?: (f: unknown, l: unknown) => void }) => {
    data?.features?.forEach((f) => {
      const pathEl = document.createElement('path')
      const layer = { bindTooltip: vi.fn(), on: vi.fn(), getElement: vi.fn(() => pathEl), setAttribute: vi.fn(), _path: pathEl }
      layers.push(layer)
      if (typeof style === 'function') style(f)
      onEachFeature?.(f, layer)
    })
    return <div data-testid="geojson">{data?.features?.length ?? 0}</div>
  },
  useMap: () => ({ invalidateSize: vi.fn(), getContainer: () => document.createElement('div') }),
}))

const geoJson = {
  features: [
    { properties: { nome: '<script>alert(1)</script>', sigla: 'XX' } },
  ],
}

beforeEach(() => {
  layers.length = 0
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => geoJson }))
})
afterEach(() => cleanup())

describe('DeforestationMap', () => {
  it('smoke renders', async () => {
    const data: Record<string, number> = { 'Pará': 1130, 'Mato Grosso': 849 }
    render(<DeforestationMap data={data} year={2026} biome="amazonia" />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByText(/amazonia — 2026/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('geojson')).toHaveTextContent('1'))
  })

  it('renders legend', async () => {
    const data: Record<string, number> = { 'Pará': 1130 }
    render(<DeforestationMap data={data} year={2024} biome="cerrado" onStateClick={() => {}} />)
    expect(screen.getAllByText('1.130').length).toBeGreaterThan(0)
    await waitFor(() => expect(screen.getByTestId('geojson')).toBeInTheDocument())
  })

  it('escapes tooltip HTML', async () => {
    const data: Record<string, number> = { '<script>alert(1)</script>': 42 }
    render(<DeforestationMap data={data} year={2026} biome="amazonia" />)
    await waitFor(() => expect(layers.length).toBe(1))
    expect(layers[0].bindTooltip).toHaveBeenCalledWith(
      expect.stringContaining('&lt;script&gt;alert(1)&lt;/script&gt;'),
      { sticky: true },
    )
  })

  it('uses data key guard defaulting to 0', async () => {
    const data: Record<string, number> = {}
    render(<DeforestationMap data={data} year={2026} biome="amazonia" />)
    await waitFor(() => expect(layers.length).toBe(1))
    expect(layers[0].bindTooltip).toHaveBeenCalledWith(
      expect.stringContaining('— 0 km²'),
      { sticky: true },
    )
  })

  it('calls onStateClick with state and km2', async () => {
    const onClick = vi.fn()
    const data: Record<string, number> = { '<script>alert(1)</script>': 7 }
    render(<DeforestationMap data={data} year={2026} biome="amazonia" onStateClick={onClick} />)
    await waitFor(() => expect(layers.length).toBe(1))
    const onMock = layers[0].on
    expect(onMock).toHaveBeenCalledWith('click', expect.any(Function))
    const handler = onMock.mock.calls.find((c) => c[0] === 'click')?.[1] as () => void
    handler()
    expect(onClick).toHaveBeenCalledWith('<script>alert(1)</script>', 7)
  })

  it('escapeHtml helper escapes entities', () => {
    expect(escapeHtml(`<a href="x">'&`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;')
  })

  it('activates onStateClick via keyboard', async () => {
    const onClick = vi.fn()
    render(<DeforestationMap data={{ 'Pará': 5 }} year={2026} biome="amazonia" onStateClick={onClick} />)
    await waitFor(() => expect(layers.length).toBe(1))
    const onMock = layers[0].on
    const kd = onMock.mock.calls.find((c) => c[0] === 'keydown')?.[1] as (e: unknown) => void
    kd({ key: 'Enter' })
    kd({ originalEvent: { key: ' ' } })
    expect(onClick).toHaveBeenCalledTimes(2)
    kd({ key: 'Escape' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('handles missing fetch gracefully', () => {
    vi.stubGlobal('fetch', undefined)
    render(<DeforestationMap data={{}} year={2026} biome="amazonia" />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('handles fetch failure gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')))
    render(<DeforestationMap data={{ 'Pará': 5 }} year={2026} biome="amazonia" />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

})