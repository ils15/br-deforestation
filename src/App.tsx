import { Suspense, lazy, useMemo, useRef, useState } from 'react'
import { amazoniaData, cerradoData, amazoniaStates2026, cerradoStates2026 } from './data/deforestation'
import Filters, { type FilterState } from './components/Filters'
import KpiGrid from './components/KpiGrid'
import AmazoniaPanel from './components/AmazoniaPanel'
import CerradoPanel from './components/CerradoPanel'
import MatopibaPanel from './components/MatopibaPanel'
import ComparativoPanel from './components/ComparativoPanel'
import NavBar from './components/NavBar'
import MobileDrawer from './components/MobileDrawer'
import SkipLink from './components/SkipLink'
import { useMapData } from './hooks/useMapData'

const DeforestationMap = lazy(() => import('./components/DeforestationMap'))

const TABS = ['Amazônia', 'Cerrado', 'MATOPIBA', 'Comparativo']

const defaultFilters: FilterState = {
  yearMin: 2006,
  yearMax: 2026,
  biome: 'Todos',
  states: [],
  minYear: 2006,
  maxYear: 2026,
  yearRange: [2006, 2026],
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const filteredAmazonia = useMemo(
    () => amazoniaData.filter((d) => d.year >= filters.yearMin && d.year <= filters.yearMax),
    [filters.yearMin, filters.yearMax],
  )
  const filteredCerrado = useMemo(
    () => cerradoData.filter((d) => d.year >= filters.yearMin && d.year <= filters.yearMax),
    [filters.yearMin, filters.yearMax],
  )

  const kpiItems = useMemo(() => {
    const lastA = filteredAmazonia[filteredAmazonia.length - 1] ?? amazoniaData[amazoniaData.length - 1]
    const lastC = filteredCerrado[filteredCerrado.length - 1] ?? cerradoData[cerradoData.length - 1]
    const peakA = amazoniaData.reduce((a, b) => (b.km2 > a.km2 ? b : a), amazoniaData[0])
    const totalA = filteredAmazonia.reduce((s, d) => s + d.km2, 0)
    const totalC = filteredCerrado.reduce((s, d) => s + d.km2, 0)
    return [
      { label: 'Amazônia (último ano)', value: Math.round(lastA.km2), unit: 'km²' },
      { label: 'Cerrado (último ano)', value: Math.round(lastC.km2), unit: 'km²' },
      { label: 'Pico Amazônia', value: Math.round(peakA.km2), unit: 'km²' },
      { label: 'Total Amazônia (filtrado)', value: Math.round(totalA), unit: 'km²' },
      { label: 'Total Cerrado (filtrado)', value: Math.round(totalC), unit: 'km²' },
      { label: 'Estados Amazônia', value: amazoniaStates2026.length },
      { label: 'Estados Cerrado', value: cerradoStates2026.length },
    ]
  }, [filteredAmazonia, filteredCerrado])

  const mapData = useMapData(filters)
  const mapYear = filters.yearMax || 2026
  const mapBiome =
    filters.biome === 'Cerrado' || filters.biome === 'MATOPIBA' ? 'Cerrado' : 'Amazônia'

  const navLinks = TABS.map((t, i) => ({
    label: t,
    onClick: () => {
      setActiveIndex(i)
      setDrawerOpen(false)
    },
  }))

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    else return
    e.preventDefault()
    setActiveIndex(next)
    tabRefs.current[next]?.focus()
  }

  const panel = (() => {
    switch (activeIndex) {
      case 0:
        return <AmazoniaPanel filters={filters} />
      case 1:
        return <CerradoPanel filters={filters} />
      case 2:
        return <MatopibaPanel filters={filters} />
      case 3:
        return <ComparativoPanel filters={filters} />
      default:
        return null
    }
  })()

  return (
    <div className="min-h-screen bg-surface-base text-text">
      <SkipLink />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <header data-testid="app-header" className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-heading sm:text-3xl">Desmatamento — Brasil</h1>
            <p className="text-sm text-text-muted">Painel de métricas de desmatamento</p>
          </div>
          <NavBar
            brand="Desmatamento — Brasil"
            links={navLinks}
            onMenuClick={() => setDrawerOpen(true)}
            onClose={() => setDrawerOpen(false)}
            menuOpen={drawerOpen}
            className="w-full sm:w-auto"
          />
        </header>

        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Menu">
          <nav aria-label="Navegação mobile" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                className="rounded-md px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={link.onClick}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </MobileDrawer>

        <div data-testid="filter-toolbar" className="mb-6">
          <Filters value={filters} onChange={setFilters} />
        </div>

        <section data-testid="kpi-strip" className="mb-6">
          <KpiGrid items={kpiItems} />
        </section>

        <div data-testid="main-grid" className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div
              role="tablist"
              aria-label="Biomas"
              className="flex flex-wrap justify-center gap-2 rounded-full border border-border bg-surface p-1"
            >
              {TABS.map((t, i) => (
                <button
                  key={t}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  role="tab"
                  id={`tab-${i}`}
                  aria-selected={i === activeIndex}
                  {...(i === activeIndex ? { 'aria-controls': `panel-${i}` } : {})}
                  tabIndex={i === activeIndex ? 0 : -1}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    i === activeIndex
                      ? 'bg-brand text-brand-foreground'
                      : 'text-text hover:bg-surface-base'
                  }`}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                >
                  {t}
                </button>
              ))}
            </div>

            <main id="main-content" data-testid="main-content" tabIndex={-1} className="outline-none">
              <div
                role="tabpanel"
                id={`panel-${activeIndex}`}
                aria-labelledby={`tab-${activeIndex}`}
                tabIndex={0}
                data-testid="tabpanel"
              >
                {panel}
              </div>
            </main>
          </div>

          <aside data-testid="map-panel" className="min-h-[320px]">
            <Suspense fallback={<div data-testid="deforestation-map-loading" />}>
              <DeforestationMap data={mapData} year={mapYear} biome={mapBiome} />
            </Suspense>
          </aside>
        </div>

        <footer data-testid="footer" className="mt-8 border-t border-border pt-4 text-center text-xs text-text-muted">
          Fonte: PRODES/INPE. Valores de 2026 são estimativa.
        </footer>
      </div>
    </div>
  )
}
