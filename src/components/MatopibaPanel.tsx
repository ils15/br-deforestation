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

const MATOPIBA_STATES = ['Maranhão', 'Tocantins', 'Piauí', 'Bahia']

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
      <section className="chart-card">
        <h2>MATOPIBA — Estados do Cerrado 2026</h2>
        <p className="source-note">Total: {Math.round(total).toLocaleString('pt-BR')} km²</p>
        <ResponsiveContainer width="100%" height={360}>
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