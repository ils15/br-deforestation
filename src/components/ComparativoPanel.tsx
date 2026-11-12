import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { amazoniaData, cerradoData } from '../data/deforestation'
import {
  yoyPct,
  movingAverage,
  forecast,
  pearsonCorrelation,
} from '../lib/analytics'
import type { FilterState } from './Filters'

export default function ComparativoPanel({ filters }: { filters: FilterState }) {
  const [horizon, setHorizon] = useState(3)
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const amazonia = useMemo(
    () => amazoniaData.filter((d) => d.year >= filters.yearMin && d.year <= filters.yearMax),
    [filters.yearMin, filters.yearMax],
  )
  const cerrado = useMemo(
    () => cerradoData.filter((d) => d.year >= filters.yearMin && d.year <= filters.yearMax),
    [filters.yearMin, filters.yearMax],
  )

  const yoyData = useMemo(() => {
    const out: { year: number; yoy: number | null }[] = []
    for (let i = 1; i < amazonia.length; i++) {
      out.push({ year: amazonia[i].year, yoy: yoyPct(amazonia[i - 1].km2, amazonia[i].km2) })
    }
    return out
  }, [amazonia])

  const maWindow = 3
  const maData = useMemo(() => {
    const series = amazonia.map((d) => d.km2)
    const ma = movingAverage(series, maWindow)
    const out: { year: number; ma: number }[] = []
    for (let i = 0; i < ma.length; i++) {
      out.push({ year: amazonia[i + maWindow - 1].year, ma: ma[i] })
    }
    return out
  }, [amazonia])

  const forecastData = useMemo(() => {
    const series = amazonia.map((d) => d.km2)
    const vals = forecast(series, horizon)
    const lastYear = amazonia.length ? amazonia[amazonia.length - 1].year : 2026
    return vals.map((v, k) => ({ year: lastYear + 1 + k, forecast: v }))
  }, [amazonia, horizon])

  const combinedForecast = useMemo(() => {
    const hist = amazonia.map((d) => ({ year: d.year, km2: d.km2, forecast: null as number | null }))
    const proj = forecastData.map((d) => ({ year: d.year, km2: null as number | null, forecast: d.forecast }))
    return [...hist, ...proj]
  }, [amazonia, forecastData])

  const scatterData = useMemo(() => {
    const out: { x: number; y: number; year: number }[] = []
    for (const a of amazonia) {
      const c = cerrado.find((x) => x.year === a.year)
      if (c) out.push({ x: a.km2, y: c.km2, year: a.year })
    }
    return out
  }, [amazonia, cerrado])

  const r = useMemo(() => {
    const xs = scatterData.map((d) => d.x)
    const ys = scatterData.map((d) => d.y)
    return pearsonCorrelation(xs, ys)
  }, [scatterData])

  return (
    <div className="panel-comparativo">
      <section className="chart-card" data-testid="yoy-chart">
        <h2>Variação Ano a Ano (%) — Amazônia</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yoyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="yoy"
              name="YoY %"
              stroke="#22c55e"
              dot={{ r: 3 }}
              isAnimationActive={!prefersReducedMotion}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card" data-testid="moving-average-chart">
        <h2>Média Móvel ({maWindow} anos) — Amazônia</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={maData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="ma"
              name="Média móvel"
              stroke="#8b5cf6"
              dot={{ r: 3 }}
              isAnimationActive={!prefersReducedMotion}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card" data-testid="forecast-chart">
        <h2>Projeção (Forecast) — Amazônia</h2>
        <div className="flow-actions">
          <label htmlFor="horizon-select">
            Horizonte
            <select
              id="horizon-select"
              data-testid="horizon-select"
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((h) => (
                <option key={h} value={h}>
                  {h} anos
                </option>
              ))}
            </select>
          </label>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={combinedForecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="km2"
              name="Histórico"
              stroke="#22c55e"
              dot={{ r: 3 }}
              isAnimationActive={!prefersReducedMotion}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Projeção"
              stroke="#ef4444"
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              isAnimationActive={!prefersReducedMotion}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card" data-testid="correlation-chart">
        <h2>Correlação Amazônia vs Cerrado</h2>
        <p className="source-note">Pearson r = {r.toFixed(3)}</p>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name="Amazônia" />
            <YAxis dataKey="y" name="Cerrado" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={scatterData} fill="#8b5cf6" isAnimationActive={!prefersReducedMotion} />
          </ScatterChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}