import { lazy, Suspense, useMemo } from 'react'
import { amazoniaStates2026, cerradoStates2026 } from '../data/deforestation'
import type { FilterState } from './Filters'

const DeforestationMap = lazy(() => import('../components/DeforestationMap'))

export default function MapaPanel({ filters }: { filters: FilterState }) {
  const useCerrado = filters.biome === 'Cerrado' || filters.biome === 'MATOPIBA'
  const base = useCerrado ? cerradoStates2026 : amazoniaStates2026
  const selected = filters.states.length ? base.filter((s) => filters.states.includes(s.state)) : base
  const data = useMemo(() => {
    const out: Record<string, number> = {}
    for (const s of selected) out[s.state] = s.km2
    return out
  }, [selected])
  const biomeLabel = useCerrado ? 'Cerrado' : 'Amazônia'

  return (
    <div className="panel-mapa">
      <Suspense fallback={<div data-testid="deforestation-map-loading" />}>
        <DeforestationMap data={data} year={filters.yearMax || 2026} biome={biomeLabel} />
      </Suspense>
    </div>
  )
}
