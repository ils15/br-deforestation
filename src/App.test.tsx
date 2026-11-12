import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

vi.mock('./components/DeforestationMap', () => ({
  default: ({ data, year, biome }: { data: Record<string, number>; year: number; biome: string }) => (
    <div data-testid="map-container" data-year={year} data-biome={biome}>
      <output data-testid="map-state-data">{JSON.stringify(data)}</output>
    </div>
  ),
}))

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
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

  it('keeps every tab connected to a panel without mounting inactive charts', () => {
    render(<App />)
    const tabs = screen.getAllByRole('tab')
    const panels = document.querySelectorAll('[role="tabpanel"]')

    expect(panels).toHaveLength(tabs.length)
    tabs.forEach((tab) => {
      const panelId = tab.getAttribute('aria-controls')
      expect(panelId).toBeTruthy()
      const panel = panelId ? document.getElementById(panelId) : null
      expect(panel).toHaveAttribute('role', 'tabpanel')
      expect(panel).toHaveAttribute('aria-labelledby', tab.id)
    })
    expect(document.getElementById('panel-0')).not.toHaveAttribute('hidden')
    expect(document.getElementById('panel-1')).toHaveAttribute('hidden')
    expect(document.getElementById('panel-1')).toBeEmptyDOMElement()
  })

  it('renders KPI grid', () => {
    render(<App />)
    expect(screen.getByTestId('kpi-grid')).toBeInTheDocument()
  })

  it('prioritizes four dashboard KPIs', () => {
    render(<App />)
    expect(screen.getAllByTestId('kpi-card')).toHaveLength(4)
  })

  it('keeps primary navigation out of the top header', () => {
    render(<App />)
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument()
  })

  it('opens one mobile navigation dialog', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })

  it('keeps the menu button control target present while the mobile drawer is closed', () => {
    render(<App />)
    const menuButton = screen.getByRole('button', { name: 'Abrir menu' })
    const controlledId = menuButton.getAttribute('aria-controls') ?? ''

    expect(controlledId).toBe('mobile-drawer')
    expect(document.getElementById(controlledId)).toHaveAttribute('hidden')
  })

  it('keeps sidebar controls uniquely identified while the drawer is open', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const ids = Array.from(document.querySelectorAll('[id]')).map((element) => element.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('renders map in main view', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument())
  })

  it('keeps map year fixed at 2026 when the chart year filter changes', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument())
    fireEvent.change(within(screen.getByTestId('filters-desktop')).getByTestId('year-max'), {
      target: { value: '2020' },
    })

    expect(screen.getByTestId('map-container')).toHaveAttribute('data-year', '2026')
    expect(screen.getByTestId('map-source-note')).toHaveTextContent(/2026.*estimativa.*PRODES\/INPE/i)
  })

  it('selects Cerrado state contributions for the map', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument())
    fireEvent.change(within(screen.getByTestId('filters-desktop')).getByTestId('biome-select'), {
      target: { value: 'Cerrado' },
    })

    expect(screen.getByTestId('map-container')).toHaveAttribute('data-biome', 'Cerrado')
    expect(screen.getByTestId('map-state-data')).toHaveTextContent('"Piauí":625.24')
    expect(screen.getByTestId('map-state-data')).not.toHaveTextContent('"Amazonas":525')
  })

  it('round-trips filters between desktop, mobile, and a reload', async () => {
    const firstRender = render(<App />)
    const desktopFilters = within(screen.getByTestId('filters-desktop'))
    fireEvent.change(desktopFilters.getByTestId('year-max'), { target: { value: '2020' } })
    fireEvent.change(desktopFilters.getByTestId('biome-select'), { target: { value: 'Cerrado' } })

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const mobileFilters = within(screen.getByTestId('filters-mobile'))
    expect(mobileFilters.getByTestId('year-max')).toHaveValue(2020)
    expect(mobileFilters.getByTestId('biome-select')).toHaveValue('Cerrado')
    fireEvent.change(mobileFilters.getByTestId('year-max'), { target: { value: '2019' } })
    fireEvent.click(screen.getByTestId('drawer-close'))
    firstRender.unmount()

    render(<App />)
    const reloadedDesktopFilters = within(screen.getByTestId('filters-desktop'))
    expect(reloadedDesktopFilters.getByTestId('year-max')).toHaveValue(2019)
    expect(reloadedDesktopFilters.getByTestId('biome-select')).toHaveValue('Cerrado')

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const reloadedMobileFilters = within(screen.getByTestId('filters-mobile'))
    expect(reloadedMobileFilters.getByTestId('year-max')).toHaveValue(2019)
    expect(reloadedMobileFilters.getByTestId('biome-select')).toHaveValue('Cerrado')
  })
})
