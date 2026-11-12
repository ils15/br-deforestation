import { useContext, useState } from 'react'
import {
  amazoniaData,
  cerradoData,
  amazoniaStates2026,
  cerradoStates2026,
} from '../data/deforestation'
import { FilterContext, normalize } from '../context/FilterContext'
import type { FilterState } from '../context/FilterContext'

export type { FilterState }

export interface FiltersProps {
  value?: Partial<FilterState>
  filters?: Partial<FilterState>
  onChange?: (next: FilterState) => void
  onFilter?: (next: FilterState) => void
  onFilterChange?: (next: FilterState) => void
  years?: number[]
  biomes?: string[]
  states?: string[]
  className?: string
  idPrefix?: string
  testId?: string
}

const DEFAULT_BIOMES = ['Todos', 'Amazônia', 'Cerrado', 'MATOPIBA']

const defaultYears = Array.from(
  new Set([...amazoniaData.map((d) => d.year), ...cerradoData.map((d) => d.year)]),
).sort((a, b) => a - b)

const defaultStates = Array.from(
  new Set([...amazoniaStates2026, ...cerradoStates2026].map((s) => s.state)),
).sort()

export default function Filters(props: FiltersProps) {
  const ctx = useContext(FilterContext)
  const controlledSource = props.value ?? props.filters ?? ctx?.filters ?? null
  const [internal, setInternal] = useState<FilterState>(() => normalize(controlledSource))
  const current = controlledSource ? normalize(controlledSource) : internal
  const idPrefix = props.idPrefix ?? ''
  const minId = `${idPrefix}year-min`
  const maxId = `${idPrefix}year-max`
  const biomeId = `${idPrefix}biome-select`
  const statesId = `${idPrefix}states-select`

  const years = props.years ?? defaultYears
  const biomes = props.biomes ?? DEFAULT_BIOMES
  const states = props.states ?? defaultStates

  function emit(next: FilterState) {
    props.onChange?.(next)
    props.onFilter?.(next)
    props.onFilterChange?.(next)
    ctx?.setFilters(next)
  }

  function patch(partial: Partial<FilterState>) {
    const next = normalize({ ...current, ...partial })
    if (!controlledSource) setInternal(next)
    emit(next)
  }

  return (
    <div
      className={`filters ${props.className ?? ''}`.trim()}
      data-testid={props.testId ?? 'filters'}
      role="group"
      aria-label="Filtros"
    >
      <label htmlFor={minId}>
        Ano mínimo
        <input
          id={minId}
          name="yearMin"
          data-testid="year-min"
          type="number"
          value={current.yearMin}
          min={years[0]}
          max={current.yearMax}
          onChange={(e) => patch({ yearMin: Number(e.target.value) })}
        />
      </label>
      <label htmlFor={maxId}>
        Ano máximo
        <input
          id={maxId}
          name="yearMax"
          data-testid="year-max"
          type="number"
          value={current.yearMax}
          min={current.yearMin}
          max={years[years.length - 1]}
          onChange={(e) => patch({ yearMax: Number(e.target.value) })}
        />
      </label>
      <label htmlFor={biomeId}>
        Bioma
        <select
          id={biomeId}
          name="biome"
          data-testid="biome-select"
          value={current.biome}
          onChange={(e) => patch({ biome: e.target.value })}
        >
          {biomes.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={statesId}>
        Estados
        <select
          id={statesId}
          name="states"
          data-testid="states-select"
          multiple
          value={current.states}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
            patch({ states: selected })
          }}
        >
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export { Filters }