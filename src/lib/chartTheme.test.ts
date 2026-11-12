import { describe, it, expect } from 'vitest'
import chartTheme, {
  chartColors,
  gridProps,
  axisProps,
  tooltipProps,
  formatNumber,
  formatPtBr,
  formatPercent,
  formatKm2,
  formatTooltip,
  formatTooltipPercent,
} from './chartTheme'

describe('chartTheme', () => {
  it('exposes shared colors', () => {
    expect(chartColors.amazonia).toBe('#22c55e')
    expect(chartColors.cerrado).toBe('#f59e0b')
  })

  it('exposes grid/axis/tooltip styles', () => {
    expect(gridProps.strokeDasharray).toBe('3 3')
    expect(axisProps.tick).toBeDefined()
    expect(tooltipProps.contentStyle).toBeDefined()
    expect(chartTheme.colors).toBe(chartColors)
    expect(chartTheme.grid).toBe(gridProps)
    expect(chartTheme.axis).toBe(axisProps)
    expect(chartTheme.tooltip).toBe(tooltipProps)
  })

  it('formats numbers in pt-BR', () => {
    expect(formatNumber(1234.5)).toBe('1.234,5')
    expect(formatPtBr(1000)).toBe('1.000')
    expect(formatPercent(12.345)).toBe('12,35%')
    expect(formatKm2(5000)).toBe('5.000 km²')
    expect(formatTooltip(5000)).toEqual(['5.000', 'km²'])
    expect(formatTooltip(5000, 'Custom')).toEqual(['5.000', 'Custom'])
    expect(formatNumber('1234.5')).toBe('1.234,5')
    expect(formatNumber(NaN)).toBe('')
    expect(formatNumber(Infinity)).toBe('Infinity')
    expect(formatNumber(-Infinity)).toBe('-Infinity')
    expect(formatNumber(undefined)).toBe('')
    expect(formatPercent('12.345')).toBe('12,35%')
    expect(formatPercent(undefined)).toBe('')
    expect(formatPercent(NaN)).toBe('')
    expect(formatPercent(null)).toBe('')
    expect(formatKm2(null)).toBe('')
    expect(formatTooltipPercent(12.345)).toEqual(['12,35%', 'YoY %'])
    expect(formatTooltipPercent(12.345, null)).toEqual(['12,35%', 'YoY %'])
    expect(formatTooltipPercent(12.345, 'Custom')).toEqual(['12,35%', 'Custom'])
    expect(formatNumber(null)).toBe('')
  })
})
