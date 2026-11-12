import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cerradoData, cerradoStates2026 } from '../data/deforestation'
import type { FilterState } from './Filters'
import {
  chartColors,
  gridProps,
  axisProps,
  tooltipProps,
  chartHeights,
  formatNumber,
  formatTooltip,
} from '../lib/chartTheme'

const EMPTY_MESSAGE = 'Sem dados — Nenhum dado disponível para o período selecionado.'

export default function CerradoPanel({ filters }: { filters: FilterState }) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const data = useMemo(
    () => cerradoData.filter((d) => d.year >= filters.yearMin && d.year <= filters.yearMax),
    [filters.yearMin, filters.yearMax],
  )
  const states = useMemo(() => {
    const base = filters.states.length
      ? cerradoStates2026.filter((s) => filters.states.includes(s.state))
      : cerradoStates2026
    return [...base].sort((a, b) => b.km2 - a.km2)
  }, [filters.states])

  return (
    <div className="panel-cerrado">
      <section className="chart-card" aria-label="Desmatamento Cerrado">
        <h2>Desmatamento — Cerrado</h2>
        {data.length === 0 ? (
          <div data-testid="chart-empty"><p className="chart-empty" data-testid="empty-state" role="status">{EMPTY_MESSAGE}</p></div>
        ) : (
          <div role="img" aria-label="Gráfico de desmatamento no Cerrado em km²"><ResponsiveContainer width="100%" height={chartHeights.md}>
            <BarChart data={data} role="img" aria-label="Gráfico de desmatamento no Cerrado em km²">
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={formatNumber} />
              <Tooltip {...tooltipProps} formatter={formatTooltip} />
              <Bar dataKey="km2" name="km²" fill={chartColors.cerrado} isAnimationActive={!prefersReducedMotion} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </section>
      <section className="chart-card" aria-label="Estados Cerrado 2026">
        <h2>Estados — Cerrado 2026</h2>
        {states.length === 0 ? (
          <div data-testid="chart-empty"><p className="chart-empty" data-testid="empty-state" role="status">{EMPTY_MESSAGE}</p></div>
        ) : (
          <div role="img" aria-label="Gráfico de estados do Cerrado em km²"><ResponsiveContainer width="100%" height={chartHeights.xl}>
            <BarChart data={states} layout="vertical" margin={{ left: 20 }} role="img" aria-label="Gráfico de estados do Cerrado em km²">
              <CartesianGrid {...gridProps} />
              <XAxis type="number" {...axisProps} tickFormatter={formatNumber} />
              <YAxis type="category" dataKey="state" width={130} {...axisProps} />
              <Tooltip {...tooltipProps} formatter={formatTooltip} />
              <Bar dataKey="km2" name="km²" fill={chartColors.cerrado} isAnimationActive={!prefersReducedMotion} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}
