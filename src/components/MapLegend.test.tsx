import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import MapLegend from './MapLegend'
import { sanitizeColor, sanitizeColors } from '../lib/mapHelpers'

afterEach(() => cleanup())

describe('MapLegend', () => {
  it('renders gradient with sanitized colors', () => {
    render(
      <MapLegend colors={['#ff0000', 'javascript:alert(1)', 'rgb(0, 0, 255)']} min={0} max={10} />,
    )
    const bar = document.querySelector('.map-legend-bar') as HTMLElement
    expect(bar.style.background).toContain('rgb(255, 0, 0)')
    expect(bar.style.background).toContain('rgb(0, 0, 255)')
    expect(bar.getAttribute('style')).not.toContain('javascript')
  })

  it('sanitizes colors helper', () => {
    expect(sanitizeColor('#abc')).toBe('#abc')
    expect(sanitizeColor('rgb(1,2,3)')).toBe('rgb(1,2,3)')
    expect(sanitizeColor('red')).toBe('red')
    expect(sanitizeColor('bad; color: red')).toBeNull()
    expect(sanitizeColors(['#fff', 'nope'])).toEqual(['#fff'])
  })

  it('shows title and labels', () => {
    render(<MapLegend title="t" min={1} max={2} />)
    expect(screen.getByText('t')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('falls back to default colors when all invalid', () => {
    render(<MapLegend colors={['bad', 'nope']} min={0} max={1} />)
    const bar = document.querySelector('.map-legend-bar') as HTMLElement
    expect(bar.style.background).toContain('rgb(254, 224, 210)')
  })
})