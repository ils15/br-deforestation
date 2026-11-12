import { useMemo, useRef, useState } from 'react'
import { amazoniaData, cerradoData, amazoniaStates2026, cerradoStates2026 } from './data/deforestation'
import Filters, { type FilterState } from './components/Filters'
import KpiGrid from './components/KpiGrid'
import AmazoniaPanel from './components/AmazoniaPanel'
import CerradoPanel from './components/CerradoPanel'
import MatopibaPanel from './components/MatopibaPanel'
import ComparativoPanel from './components/ComparativoPanel'
import MapaPanel from './components/MapaPanel'
import './App.css'

const TABS = ['Amazônia', 'Cerrado', 'MATOPIBA', 'Comparativo', 'Mapa']

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
      case 4:
        return <MapaPanel filters={filters} />
      default:
        return null
    }
  })()

  return (
    <div className="app">
      <header className="app-header">
        <h1>Desmatamento — Brasil</h1>
        <p className="subtitle">Painel de métricas de desmatamento</p>
      </header>
      <Filters value={filters} onChange={setFilters} />
      <KpiGrid items={kpiItems} />
      <div role="tablist" aria-label="Biomas" className="tabs">
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
            className={`tab${i === activeIndex ? ' active' : ''}`}
            onClick={() => setActiveIndex(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {t}
          </button>
        ))}
      </div>
      <main className="tab-content">
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
      <p className="source-note">Fonte: PRODES/INPE. Valores de 2026 são estimativa.</p>
    </div>
  )
}
