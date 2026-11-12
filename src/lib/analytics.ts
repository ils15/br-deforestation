/**
 * Year-over-year percentage change.
 * When `prev` is 0 the change is undefined; returns `Infinity`
 * (number type permits Infinity) to signal an unbounded increase.
 */
export function yoyPct(prev: number, curr: number): number {
  if (prev === 0) return Infinity
  const pct = ((curr - prev) / prev) * 100
  return Math.round(pct * 100) / 100
}

export function movingAverage(series: number[], window: number): number[] {
  if (!Number.isInteger(window) || window <= 0) {
    throw new Error('window must be a positive integer')
  }
  if (window > series.length) return []
  const out: number[] = []
  for (let i = 0; i + window <= series.length; i++) {
    let sum = 0
    for (let j = 0; j < window; j++) sum += series[i + j]
    out.push(sum / window)
  }
  return out
}

export function linearTrend(series: number[]): { slope: number; intercept: number } {
  const n = series.length
  if (n === 0) return { slope: 0, intercept: 0 }
  let sumX = 0
  let sumY = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += series[i]
  }
  const meanX = sumX / n
  const meanY = sumY / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (series[i] - meanY)
    den += (i - meanX) * (i - meanX)
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = meanY - slope * meanX
  return { slope, intercept }
}

export function forecast(series: number[], horizon: number): number[] {
  if (horizon <= 0) return []
  if (series.length === 0) return []
  const { slope, intercept } = linearTrend(series)
  const n = series.length
  const out: number[] = []
  for (let k = 0; k < horizon; k++) {
    const x = n + k
    const value = slope * x + intercept
    out.push(Math.round(value * 100) / 100)
  }
  return out
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n === 0) return 0
  let sumX = 0
  let sumY = 0
  for (let i = 0; i < n; i++) {
    sumX += x[i]
    sumY += y[i]
  }
  const meanX = sumX / n
  const meanY = sumY / n
  let num = 0
  let denX = 0
  let denY = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  const den = Math.sqrt(denX * denY)
  if (den === 0) return 0
  return num / den
}
