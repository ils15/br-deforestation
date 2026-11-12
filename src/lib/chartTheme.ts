/**
 * Shared chart theme for the BR deforestation dashboard.
 */
export const chartColors = {
  amazonia: '#22c55e',
  cerrado: '#f59e0b',
  matopiba: '#f59e0b',
  projection: '#ef4444',
  movingAverage: '#8b5cf6',
  correlation: '#8b5cf6',
  grid: '#2a2e3a',
  axis: '#9ca3af',
  text: '#e5e7eb',
  heading: '#f9fafb',
  surface: '#1a1d27',
  border: '#2a2e3a',
  brand: '#8b5cf6',
  primary: '#8b5cf6',
  secondary: '#22c55e',
  accent: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#8b5cf6',
  background: '#0f1117',
  muted: '#9ca3af',
} as const

export const gridProps = {
  stroke: chartColors.grid,
  strokeDasharray: '3 3',
  vertical: true,
  horizontal: true,
} as const

export const axisProps = {
  stroke: chartColors.axis,
  tick: { fill: chartColors.axis, fontSize: 12 },
  axisLine: { stroke: chartColors.border },
  tickLine: { stroke: chartColors.border },
} as const

export const tooltipProps = {
  contentStyle: {
    backgroundColor: chartColors.surface,
    border: `1px solid ${chartColors.border}`,
    borderRadius: 8,
    color: chartColors.text,
    fontSize: 12,
  },
  labelStyle: { color: chartColors.heading, fontWeight: 600 },
  itemStyle: { color: chartColors.text },
  cursor: { stroke: chartColors.border, strokeDasharray: '3 3' },
} as const

export const legendProps = {
  wrapperStyle: { color: chartColors.text, fontSize: 12 },
  iconType: 'line' as const,
} as const

export const chartHeights = {
  sm: 280,
  md: 320,
  lg: 360,
  xl: 420,
} as const

export function formatNumber(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (n === null || n === undefined || !Number.isFinite(n)) {
    if (n === Infinity || n === -Infinity) return String(n)
    return ''
  }
  return new Intl.NumberFormat('pt-BR').format(n)
}

export function formatPtBr(value: number | string | null | undefined): string {
  return formatNumber(value)
}

export function formatPercent(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (n === null || n === undefined || !Number.isFinite(n)) return ''
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(n)}%`
}

export function formatKm2(value: number | string | null | undefined): string {
  const formatted = formatNumber(value)
  return formatted ? `${formatted} km²` : ''
}

export function formatTooltip(value: unknown, name?: unknown): [string, string] {
  const label = name === undefined || name === null ? 'km²' : String(name)
  return [formatNumber(value as number | string | null | undefined), label]
}

export function formatTooltipPercent(value: unknown, name?: unknown): [string, string] {
  const label = name === undefined || name === null ? 'YoY %' : String(name)
  return [formatPercent(value as number | string | null | undefined), label]
}

export const chartTheme = {
  colors: chartColors,
  grid: gridProps,
  axis: axisProps,
  tooltip: tooltipProps,
  legend: legendProps,
  heights: chartHeights,
  formatNumber,
  formatPtBr,
  formatPercent,
  formatKm2,
  formatTooltip,
  formatTooltipPercent,
} as const

export default chartTheme