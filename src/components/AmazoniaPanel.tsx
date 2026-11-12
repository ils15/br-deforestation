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
      <section className="chart-card">
        <h2>Desmatamento — Amazônia</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="km2" name="km²" stroke="#22c55e" dot={{ r: 3 }} isAnimationActive={!prefersReducedMotion} />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section className="chart-card">
        <h2>Estados — Amazônia 2026</h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={states} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="state" width={110} />
            <Tooltip />
            <Bar dataKey="km2" name="km²" fill="#22c55e" isAnimationActive={!prefersReducedMotion} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}