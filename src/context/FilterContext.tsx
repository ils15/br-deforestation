/* oxlint-disable react/only-export-components */
import { createContext } from 'react'

export interface FilterState {
  yearMin: number
  yearMax: number
  biome: string
  states: string[]
  minYear?: number
  maxYear?: number
  yearRange?: [number, number]
}

export function normalize(partial?: Partial<FilterState> | null): FilterState {
  const yearMin = partial?.yearMin ?? partial?.minYear ?? 2006
  const yearMax = partial?.yearMax ?? partial?.maxYear ?? 2026
  return {
    yearMin,
    yearMax,
    biome: partial?.biome ?? 'Todos',
    states: partial?.states ?? [],
    minYear: yearMin,
    maxYear: yearMax,
    yearRange: [yearMin, yearMax],
  }
}

export interface FilterContextValue {
  filters: FilterState
  setFilters: (next: FilterState) => void
}

export const FilterContext = createContext<FilterContextValue | null>(null)