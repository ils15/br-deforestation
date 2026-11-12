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
      <section className="chart-card">
        <h2>Desmatamento — Cerrado</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="km2" name="km²" fill="#f59e0b" isAnimationActive={!prefersReducedMotion} />
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="chart-card">
        <h2>Estados — Cerrado 2026</h2>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={states} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="state" width={130} />
            <Tooltip />
            <Bar dataKey="km2" name="km²" fill="#f59e0b" isAnimationActive={!prefersReducedMotion} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}