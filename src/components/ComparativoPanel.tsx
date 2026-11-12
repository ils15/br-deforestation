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
import {
  chartColors,
  gridProps,
  axisProps,
  tooltipProps,
  legendProps,
  chartHeights,
  formatNumber,
  formatPercent,
  formatTooltip,
  formatTooltipPercent,
} from '../lib/chartTheme'

const EMPTY_MESSAGE = 'Sem dados — Nenhum dado disponível para o período selecionado.'

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
      <section className="chart-card" data-testid="yoy-chart" aria-label="Variação ano a ano Amazônia">
        <h2>Variação Ano a Ano (%) — Amazônia</h2>
        {yoyData.length === 0 ? (
          <div data-testid="chart-empty"><p className="chart-empty" data-testid="empty-state" role="status">{EMPTY_MESSAGE}</p></div>
        ) : (
          <div role="img" aria-label="Gráfico de variação ano a ano na Amazônia em porcentagem"><ResponsiveContainer width="100%" height={chartHeights.md}>
            <LineChart data={yoyData} role="img" aria-label="Gráfico de variação ano a ano na Amazônia em porcentagem">
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={formatPercent} />
              <Tooltip {...tooltipProps} formatter={formatTooltipPercent} />
              <Line
                type="monotone"
                dataKey="yoy"
                name="YoY %"
                stroke={chartColors.amazonia}
                dot={{ r: 3 }}
                isAnimationActive={!prefersReducedMotion}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="chart-card" data-testid="moving-average-chart" aria-label="Média móvel Amazônia">
        <h2>Média Móvel ({maWindow} anos) — Amazônia</h2>
        {maData.length === 0 ? (
          <div data-testid="chart-empty"><p className="chart-empty" data-testid="empty-state" role="status">{EMPTY_MESSAGE}</p></div>
        ) : (
          <div role="img" aria-label="Gráfico de média móvel na Amazônia em km²"><ResponsiveContainer width="100%" height={chartHeights.md}>
            <LineChart data={maData} role="img" aria-label="Gráfico de média móvel na Amazônia em km²">
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={formatNumber} />
              <Tooltip {...tooltipProps} formatter={formatTooltip} />
              <Line
                type="monotone"
                dataKey="ma"
                name="Média móvel"
                stroke={chartColors.movingAverage}
                dot={{ r: 3 }}
                isAnimationActive={!prefersReducedMotion}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="chart-card" data-testid="forecast-chart" aria-label="Projeção Amazônia">
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
        {combinedForecast.length === 0 ? (
          <div data-testid="chart-empty"><p className="chart-empty" data-testid="empty-state" role="status">{EMPTY_MESSAGE}</p></div>
        ) : (
          <div role="img" aria-label="Gráfico de projeção na Amazônia em km²"><ResponsiveContainer width="100%" height={chartHeights.md}>
            <LineChart data={combinedForecast} role="img" aria-label="Gráfico de projeção na Amazônia em km²">
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={formatNumber} />
              <Tooltip {...tooltipProps} formatter={formatTooltip} />
              <Legend {...legendProps} />
              <Line
                type="monotone"
                dataKey="km2"
                name="Histórico"
                stroke={chartColors.amazonia}
                dot={{ r: 3 }}
                isAnimationActive={!prefersReducedMotion}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Projeção"
                stroke={chartColors.projection}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                isAnimationActive={!prefersReducedMotion}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="chart-card" data-testid="correlation-chart" aria-label="Correlação Amazônia Cerrado">
        <h2>Correlação Amazônia vs Cerrado</h2>
        <p className="source-note">Pearson r = {r.toFixed(3)}</p>
        {scatterData.length === 0 ? (
          <div data-testid="chart-empty"><p className="chart-empty" data-testid="empty-state" role="status">{EMPTY_MESSAGE}</p></div>
        ) : (
          <div role="img" aria-label="Gráfico de correlação entre Amazônia e Cerrado"><ResponsiveContainer width="100%" height={chartHeights.md}>
            <ScatterChart role="img" aria-label="Gráfico de correlação entre Amazônia e Cerrado">
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="x" name="Amazônia" {...axisProps} tickFormatter={formatNumber} />
              <YAxis dataKey="y" name="Cerrado" {...axisProps} tickFormatter={formatNumber} />
              <Tooltip {...tooltipProps} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill={chartColors.correlation} isAnimationActive={!prefersReducedMotion} />
            </ScatterChart>
          </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}
