/* oxlint-disable react/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

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

export function useFilters(): FilterState {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within FilterProvider')
  return ctx.filters
}

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilterContext must be used within FilterProvider')
  return ctx
}

export function FilterProvider({
  children,
  initial,
}: {
  children: ReactNode
  initial?: Partial<FilterState>
}) {
  const [filters, setFilters] = useState<FilterState>(() => normalize(initial))
  const value = useMemo(() => ({ filters, setFilters }), [filters])
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}
