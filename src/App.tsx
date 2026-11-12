import { Suspense, lazy, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { amazoniaData, cerradoData, MAP_DATA_YEAR } from './data/deforestation'
import Filters, { type FilterState } from './components/Filters'
import { normalize } from './context/FilterContext'
import KpiGrid from './components/KpiGrid'
import AmazoniaPanel from './components/AmazoniaPanel'
import CerradoPanel from './components/CerradoPanel'
import MatopibaPanel from './components/MatopibaPanel'
import ComparativoPanel from './components/ComparativoPanel'
import MobileDrawer from './components/MobileDrawer'
import SkipLink from './components/SkipLink'
import Sidebar, { type SidebarGroup } from './components/Sidebar'
import { useMapData } from './hooks/useMapData'

const DeforestationMap = lazy(() => import('./components/DeforestationMap'))

const TABS = ['Amazônia', 'Cerrado', 'MATOPIBA', 'Comparativo']

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: 'Biomas',
    items: TABS.map((t) => ({ label: t, key: t })),
  },
]

const defaultFilters: FilterState = {
  yearMin: 2006,
  yearMax: 2026,
  biome: 'Todos',
  states: [],
  minYear: 2006,
  maxYear: 2026,
  yearRange: [2006, 2026],
}

const FILTERS_STORAGE_KEY = 'br-deforestation:filters'

function loadFilters(): FilterState {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY)
    if (!raw) return defaultFilters
    const parsed = JSON.parse(raw) as Partial<FilterState>
    return normalize(parsed)
  } catch {
    return defaultFilters
  }
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [filters, setFilters] = useState<FilterState>(loadFilters())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function updateFilters(next: FilterState) {
    setFilters(next)
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }

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
    const totalA = filteredAmazonia.reduce((s, d) => s + d.km2, 0)
    const totalC = filteredCerrado.reduce((s, d) => s + d.km2, 0)
    return [
      { label: 'Amazônia · último ano', value: Math.round(lastA.km2), unit: 'km²' },
      { label: 'Cerrado · último ano', value: Math.round(lastC.km2), unit: 'km²' },
      { label: 'Total Amazônia · período', value: Math.round(totalA), unit: 'km²' },
      { label: 'Total Cerrado · período', value: Math.round(totalC), unit: 'km²' },
    ]
  }, [filteredAmazonia, filteredCerrado])

  const mapData = useMapData(filters)
  const mapYear = MAP_DATA_YEAR
  const mapBiome = filters.biome === 'Cerrado' || filters.biome === 'MATOPIBA' ? 'Cerrado' : 'Amazônia'

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

  function renderSidebar(idPrefix: string, testId: string): ReactNode {
    return (
      <Sidebar
        activeKey={TABS[activeIndex]}
        onNavigate={(key) => {
          setActiveIndex(TABS.indexOf(key))
          setDrawerOpen(false)
        }}
        groups={SIDEBAR_GROUPS}
        className="dashboard-sidebar"
        idPrefix={`${idPrefix}nav-`}
        footer={
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-text-heading">Filtros</h2>
            <Filters
              value={filters}
              onChange={updateFilters}
              idPrefix={idPrefix}
              testId={testId}
            />
          </div>
        }
      />
    )
  }

  return (
    <div className="min-h-screen bg-surface-base text-text">
      <SkipLink />
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <header data-testid="app-header" className="mb-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Monitoramento florestal</p>
            <h1 className="text-2xl font-bold tracking-tight text-text-heading sm:text-3xl">Desmatamento — Brasil</h1>
            <p className="mt-1 text-sm text-text-muted">Painel de métricas de desmatamento</p>
          </div>
          <button
            type="button"
            data-testid="menu-button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-heading transition-colors hover:bg-surface-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
            aria-label={drawerOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen((open) => !open)}
          >
            <span aria-hidden="true">{drawerOpen ? '✕' : '☰'}</span>
          </button>
        </header>

        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Navegação e filtros">
          {renderSidebar('mobile-', 'filters-mobile')}
        </MobileDrawer>

        <section data-testid="kpi-strip" className="mb-6">
          <KpiGrid items={kpiItems} />
        </section>

        <div data-testid="main-grid" className="grid min-w-0 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div data-testid="sidebar-panel" className="hidden min-w-0 lg:block">
            {renderSidebar('desktop-', 'filters-desktop')}
          </div>

          <main id="main-content" data-testid="main-content" className="min-w-0" tabIndex={-1}>
            <div className="dashboard-content-grid">
              <div className="min-w-0">
                <div
                  role="tablist"
                  aria-label="Biomas"
                  className="mb-5 flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-1.5"
                >
                  {TABS.map((t, i) => (
                    <button
                      key={t}
                      ref={(el) => {
                        tabRefs.current[i] = el
                      }}
                      role="tab"
                      aria-selected={i === activeIndex}
                      id={`tab-${i}`}
                      aria-controls={`panel-${i}`}
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
                {TABS.map((tab, i) => (
                  <div
                    key={tab}
                    role="tabpanel"
                    id={`panel-${i}`}
                    aria-labelledby={`tab-${i}`}
                    tabIndex={0}
                    hidden={activeIndex !== i}
                    data-testid={`tabpanel-${i}`}
                  >
                    {activeIndex === i ? panel : null}
                  </div>
                ))}
              </div>

              <aside data-testid="map-panel" aria-label="Mapa de desmatamento" className="map-card min-w-0">
                <p data-testid="map-source-note" className="mb-3 text-sm text-text-muted">
                  Ano de referência dos dados estaduais: {MAP_DATA_YEAR} (estimativa). Fonte: PRODES/INPE.
                </p>
                <Suspense fallback={<div data-testid="deforestation-map-loading" />}>
                  <DeforestationMap data={mapData} year={mapYear} biome={mapBiome} />
                </Suspense>
              </aside>
            </div>
          </main>
        </div>

        <footer data-testid="footer" className="mt-8 border-t border-border pt-4 text-center text-xs text-text-muted">
          Fonte: PRODES/INPE. Valores de 2026 são estimativa.
        </footer>
      </div>
    </div>
  )
}
