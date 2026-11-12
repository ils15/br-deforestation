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
import { cerradoStates2026 } from '../data/deforestation'
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

const MATOPIBA_STATES = ['Maranhão', 'Tocantins', 'Piauí', 'Bahia']
const EMPTY_MESSAGE = 'Sem dados — Nenhum dado disponível para o período selecionado.'

export default function MatopibaPanel({ filters }: { filters: FilterState }) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const states = useMemo(() => {
    const base = cerradoStates2026.filter((s) => MATOPIBA_STATES.includes(s.state))
    const filtered = filters.states.length ? base.filter((s) => filters.states.includes(s.state)) : base
    return [...filtered].sort((a, b) => b.km2 - a.km2)
  }, [filters.states])

  const total = states.reduce((s, d) => s + d.km2, 0)

  return (
    <div className="panel-matopiba">
      <section className="chart-card" aria-label="MATOPIBA estados do Cerrado 2026">
        <h2>MATOPIBA — Estados do Cerrado 2026</h2>
        <p className="source-note">Total: {formatNumber(Math.round(total))} km²</p>
        {states.length === 0 ? (
          <div data-testid="chart-empty"><p className="chart-empty" data-testid="empty-state" role="status">{EMPTY_MESSAGE}</p></div>
        ) : (
          <div role="img" aria-label="Gráfico dos estados do MATOPIBA em km²"><ResponsiveContainer width="100%" height={chartHeights.lg}>
            <BarChart data={states} layout="vertical" margin={{ left: 20 }} role="img" aria-label="Gráfico dos estados do MATOPIBA em km²">
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
