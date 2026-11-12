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
  Legend,
} from 'recharts'
import {
  amazoniaData,
  cerradoData,
  amazoniaStates2026,
  cerradoStates2026,
} from '../data/deforestation'

function Kpi({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {value.toLocaleString('pt-BR')} {unit ?? ''}
      </div>
    </div>
  )
}

export function DeforestationTab() {
  const lastAmazonia = amazoniaData[amazoniaData.length - 1]
  const lastCerrado = cerradoData[cerradoData.length - 1]
  const peakAmazonia = useMemo(
    () => amazoniaData.reduce((a, b) => (b.km2 > a.km2 ? b : a)),
    [],
  )
  const totalAmazonia = useMemo(
    () => amazoniaData.reduce((s, d) => s + d.km2, 0),
    [],
  )
  const totalCerrado = useMemo(
    () => cerradoData.reduce((s, d) => s + d.km2, 0),
    [],
  )

  const amazoniaSorted = useMemo(
    () => [...amazoniaStates2026].sort((a, b) => b.km2 - a.km2),
    [],
  )
  const cerradoSorted = useMemo(
    () => [...cerradoStates2026].sort((a, b) => b.km2 - a.km2),
    [],
  )

  return (
    <div className="deforestation">
      <div className="kpi-grid">
        <Kpi label="Amazônia 2026 (est.)" value={lastAmazonia.km2} unit="km²" />
        <Kpi label="Cerrado 2026" value={lastCerrado.km2} unit="km²" />
        <Kpi label="Pico Amazônia (2008)" value={peakAmazonia.km2} unit="km²" />
        <Kpi label="Total Amazônia 2006-2026" value={Math.round(totalAmazonia)} unit="km²" />
        <Kpi label="Total Cerrado 2018-2026" value={Math.round(totalCerrado)} unit="km²" />
        <Kpi label="Estados Amazônia 2026" value={amazoniaStates2026.length} />
      </div>

      <section className="chart-card">
        <h2>Desmatamento — Amazônia (2006-2026)</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={amazoniaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="km2" name="km²" stroke="#22c55e" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card">
        <h2>Desmatamento — Cerrado (2018-2026)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cerradoData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="km2" name="km²" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card">
        <h2>Estados — Amazônia 2026 (horizontal)</h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={amazoniaSorted} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={110} />
            <Tooltip />
            <Bar dataKey="km2" name="km²" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card">
        <h2>Estados — Cerrado 2026 (horizontal)</h2>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={cerradoSorted} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={130} />
            <Tooltip />
            <Bar dataKey="km2" name="km²" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <p className="source-note">Fonte: PRODES/INPE. Valores de 2026 são estimativa.</p>
    </div>
  )
}
