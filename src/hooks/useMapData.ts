import { useMemo } from 'react'
import { amazoniaStates2026, cerradoStates2026 } from '../data/deforestation'
import type { FilterState } from '../context/FilterContext'

export function useMapData(filters: FilterState): Record<string, number> {
  return useMemo(() => {
    const useCerrado = filters.biome === 'Cerrado' || filters.biome === 'MATOPIBA'
    const base = useCerrado ? cerradoStates2026 : amazoniaStates2026
    const selected =
      filters.states.length > 0
        ? base.filter((s) => filters.states.includes(s.state))
        : base
    const out: Record<string, number> = {}
    for (const s of selected) out[s.state] = s.km2
    return out
  }, [filters.biome, filters.states])
}