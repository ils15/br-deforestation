import { useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { amazoniaData, amazoniaStates2026 } from '../data/deforestation'
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

export default function AmazoniaPanel({ filters }: { filters: FilterState }) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const data = useMemo(
    () => amazoniaData.filter((d) => d.year >= filters.yearMin && d.year <= filters.yearMax),
    [filters.yearMin, filters.yearMax],
  )
  const states = useMemo(() => {
    const base = filters.states.length
      ? amazoniaStates2026.filter((s) => filters.states.includes(s.state))
      : amazoniaStates2026
    return [...base].sort((a, b) => b.km2 - a.km2)
  }, [filters.states])

  return (
    <div className="panel-amazonia">
      <section className="chart-card" aria-label="Desmatamento Amazônia">
        <h2>Desmatamento — Amazônia</h2>
        {data.length === 0 ? (
          <div data-testid="chart-empty"><p className="chart-empty" data-testid="empty-state" role="status">{EMPTY_MESSAGE}</p></div>
        ) : (
          <div role="img" aria-label="Gráfico de desmatamento na Amazônia em km²"><ResponsiveContainer width="100%" height={chartHeights.md}>
            <LineChart data={data} role="img" aria-label="Gráfico de desmatamento na Amazônia em km²">
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={formatNumber} />
              <Tooltip {...tooltipProps} formatter={formatTooltip} />
              <Line
                type="monotone"
                dataKey="km2"
                name="km²"
                stroke={chartColors.amazonia}
                dot={{ r: 3 }}
                isAnimationActive={!prefersReducedMotion}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}
      </section>
      <section className="chart-card" aria-label="Estados Amazônia 2026">
        <h2>Estados — Amazônia 2026</h2>
        {states.length === 0 ? (
          <div data-testid="chart-empty"><p className="chart-empty" data-testid="empty-state" role="status">{EMPTY_MESSAGE}</p></div>
        ) : (
          <div role="img" aria-label="Gráfico de estados da Amazônia em km²"><ResponsiveContainer width="100%" height={chartHeights.lg}>
            <BarChart data={states} layout="vertical" margin={{ left: 20 }} role="img" aria-label="Gráfico de estados da Amazônia em km²">
              <CartesianGrid {...gridProps} />
              <XAxis type="number" {...axisProps} tickFormatter={formatNumber} />
              <YAxis type="category" dataKey="state" width={110} {...axisProps} />
              <Tooltip {...tooltipProps} formatter={formatTooltip} />
              <Bar dataKey="km2" name="km²" fill={chartColors.amazonia} isAnimationActive={!prefersReducedMotion} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}
