import { sanitizeColors } from '../lib/mapHelpers'
const DEFAULT_COLORS = ['#fee0d2', '#fc9272', '#de2d26', '#a50f15', '#67000d']


export interface MapLegendProps {
  min?: number
  max?: number
  colors?: string[]
  title?: string
  unit?: string
}

export default function MapLegend({
  min = 0,
  max = 1,
  colors = DEFAULT_COLORS,
  title,
  unit = 'km²',
}: MapLegendProps) {
  const safe = sanitizeColors(colors)
  const palette = safe.length ? safe : sanitizeColors(DEFAULT_COLORS)
  const gradient = `linear-gradient(to right, ${palette.join(', ')})`
  return (
    <div
      className="map-legend"
      role="img"
      aria-label={`Legenda: de ${min} a ${max} ${unit}`}
    >
      {title !== undefined && <div className="map-legend-title">{title}</div>}
      <div className="map-legend-bar" style={{ background: gradient }} />
      <div className="map-legend-labels">
        <span>{min.toLocaleString('pt-BR')}</span>
        <span>{max.toLocaleString('pt-BR')}</span>
      </div>
      <div className="map-legend-unit">{unit}</div>
    </div>
  )
}