import { describe, it, expect } from 'vitest'
import {
  yoyPct,
  movingAverage,
  linearTrend,
  forecast,
  pearsonCorrelation,
} from './analytics'

describe('analytics', () => {
  it('yoyPct golden', () => {
    expect(yoyPct(100, 80)).toBe(-20)
  })

  it('movingAverage golden', () => {
    expect(movingAverage([10, 20, 30, 40], 2)).toEqual([15, 25, 35])
  })

  it('pearsonCorrelation known value', () => {
    expect(pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])).toBe(1)
    expect(pearsonCorrelation([1, 2, 3, 4, 5], [5, 4, 3, 2, 1])).toBe(-1)
  })

  it('forecast golden', () => {
    expect(forecast([1, 2, 3], 2)).toEqual([4, 5])
    expect(forecast([10, 20, 30, 40], 3)).toEqual([50, 60, 70])
  })

  it('linearTrend', () => {
    expect(linearTrend([1, 2, 3])).toEqual({ slope: 1, intercept: 1 })
  })

  it('edge cases', () => {
    expect(yoyPct(0, 10)).toBe(Infinity)
    expect(movingAverage([], 2)).toEqual([])
    expect(movingAverage([1, 2, 3], 5)).toEqual([])
    expect(() => movingAverage([1, 2, 3], 0)).toThrow('window must be a positive integer')
    expect(linearTrend([])).toEqual({ slope: 0, intercept: 0 })
    expect(linearTrend([5])).toEqual({ slope: 0, intercept: 5 })
    expect(forecast([], 0)).toEqual([])
    expect(forecast([], 3)).toEqual([])
    expect(forecast([1, 2, 3], 0)).toEqual([])
    expect(pearsonCorrelation([], [])).toBe(0)
    expect(pearsonCorrelation([1, 1], [2, 3])).toBe(0)
  })
})
