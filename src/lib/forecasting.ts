/**
 * Damped Holt's linear trend (ETS(A, Ad, N)) forecast with bootstrap intervals.
 *
 * level_t = alpha * y_t + (1 - alpha) * (level_{t-1} + phi * trend_{t-1})
 * trend_t = beta * (level_t - level_{t-1}) + (1 - beta) * phi * trend_{t-1}
 * forecast_{t+h} = level_t + trend_t * phi * (1 - phi^h) / (1 - phi)
 */

function quantile(sorted: number[], q: number): number {
  const idx = q * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const frac = idx - lo;
  return sorted[lo] + (sorted[hi] - sorted[lo]) * frac;
}

// Deterministic PRNG (mulberry32) so bootstrap results are reproducible.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function holtDampedTrendForecast(
  series: number[],
  horizon: number,
  options?: { alpha?: number; beta?: number; phi?: number },
): {
  forecast: number[];
  lower: number[];
  upper: number[];
  params: { alpha: number; beta: number; phi: number };
} {
  const alpha = options?.alpha ?? 0.2;
  const beta = options?.beta ?? 0.1;
  const phi = options?.phi ?? 0.9;

  const n = series.length;
  const round2 = (v: number) => Math.round(v * 100) / 100;
  const clamp0 = (v: number) => Math.max(0, v);

  // Short series fallback (n < 5): naive = last value
  if (n < 5) {
    const last = series[series.length - 1];
    const fc = Array.from({ length: horizon }, () => round2(clamp0(last)));
    return { forecast: fc, lower: [...fc], upper: [...fc], params: { alpha, beta, phi } };
  }

  // ETS(A, Ad, N) damped trend filtering
  let level = series[0];
  let trend = n > 1 ? series[1] - series[0] : 0;
  const residuals: number[] = [];

  for (let t = 1; t < n; t++) {
    const levelPrev = level;
    const trendPrev = trend;
    const oneStepForecast = levelPrev + phi * trendPrev;
    residuals.push(series[t] - oneStepForecast);

    level = alpha * series[t] + (1 - alpha) * (levelPrev + phi * trendPrev);
    trend = beta * (level - levelPrev) + (1 - beta) * phi * trendPrev;
  }

  // Center residuals so bootstrap is unbiased
  const meanResidual = residuals.reduce((s, r) => s + r, 0) / residuals.length;
  const centered = residuals.map((r) => r - meanResidual);

  const forecast: number[] = [];
  const baseForecasts: number[] = [];

  for (let h = 1; h <= horizon; h++) {
    const phiH = Math.pow(phi, h);
    const trendContribution = phi * (1 - phiH) / (1 - phi);
    const f = level + trend * trendContribution;
    baseForecasts.push(f);
    forecast.push(round2(clamp0(f)));
  }

  // Bootstrap prediction intervals: B=500, resample centered residuals
  const B = 500;
  const rng = mulberry32(42);
  const lower: number[] = [];
  const upper: number[] = [];

  for (let h = 1; h <= horizon; h++) {
    const baseF = baseForecasts[h - 1];
    const bootstrapped: number[] = [];
    for (let b = 0; b < B; b++) {
      const idx = Math.floor(rng() * centered.length);
      bootstrapped.push(baseF + centered[idx]);
    }
    bootstrapped.sort((a, b) => a - b);

    // 95% interval: 0.025 and 0.975 quantiles
    lower.push(round2(clamp0(quantile(bootstrapped, 0.025))));
    upper.push(round2(clamp0(quantile(bootstrapped, 0.975))));
  }

  return {
    forecast,
    lower,
    upper,
    params: { alpha, beta, phi },
  };
}

/**
 * ETS(A, A, N) — additive error, additive trend, no seasonality, no damping.
 *
 * level_t = alpha * y_t + (1 - alpha) * (level_{t-1} + trend_{t-1})
 * trend_t = beta * (level_t - level_{t-1}) + (1 - beta) * trend_{t-1}
 * forecast_{t+h} = level_t + h * trend_t
 */
export function etsAANForecast(
  series: number[],
  horizon: number,
  options?: { alpha?: number; beta?: number },
): {
  forecast: number[];
  lower: number[];
  upper: number[];
  params: { alpha: number; beta: number };
} {
  const alpha = options?.alpha ?? 0.2;
  const beta = options?.beta ?? 0.1;

  const n = series.length;
  const round2 = (v: number) => Math.round(v * 100) / 100;
  const clamp0 = (v: number) => Math.max(0, v);

  // Short series fallback (n < 5): naive = last value
  if (n < 5) {
    const last = series[series.length - 1];
    const fc = Array.from({ length: horizon }, () => round2(clamp0(last)));
    return { forecast: fc, lower: [...fc], upper: [...fc], params: { alpha, beta } };
  }

  // ETS(A, A, N) additive trend filtering
  let level = series[0];
  let trend = n > 1 ? series[1] - series[0] : 0;
  const residuals: number[] = [];

  for (let t = 1; t < n; t++) {
    const levelPrev = level;
    const trendPrev = trend;
    const oneStepForecast = levelPrev + trendPrev;
    residuals.push(series[t] - oneStepForecast);

    level = alpha * series[t] + (1 - alpha) * (levelPrev + trendPrev);
    trend = beta * (level - levelPrev) + (1 - beta) * trendPrev;
  }

  // Center residuals so bootstrap is unbiased
  const meanResidual = residuals.reduce((s, r) => s + r, 0) / residuals.length;
  const centered = residuals.map((r) => r - meanResidual);

  const forecast: number[] = [];
  const baseForecasts: number[] = [];

  for (let h = 1; h <= horizon; h++) {
    const f = level + h * trend;
    baseForecasts.push(f);
    forecast.push(round2(clamp0(f)));
  }

  // Bootstrap prediction intervals: B=500, resample centered residuals
  const B = 500;
  const rng = mulberry32(42);
  const lower: number[] = [];
  const upper: number[] = [];

  for (let h = 1; h <= horizon; h++) {
    const baseF = baseForecasts[h - 1];
    const bootstrapped: number[] = [];
    for (let b = 0; b < B; b++) {
      const idx = Math.floor(rng() * centered.length);
      bootstrapped.push(baseF + centered[idx]);
    }
    bootstrapped.sort((a, b) => a - b);

    // 95% interval: 0.025 and 0.975 quantiles
    lower.push(round2(clamp0(quantile(bootstrapped, 0.025))));
    upper.push(round2(clamp0(quantile(bootstrapped, 0.975))));
  }

  return {
    forecast,
    lower,
    upper,
    params: { alpha, beta },
  };
}

/**
 * ARIMA(p, d, q) forecast for small orders with bootstrap intervals.
 * Falls back to linear trend if estimation fails.
 */
export function arimaForecast(
  series: number[],
  horizon: number,
  options?: { p?: number; d?: number; q?: number },
): {
  forecast: number[];
  lower: number[];
  upper: number[];
  params: { p: number; d: number; q: number; coefficients?: { ar: number[]; ma: number[] } };
} {
  const p = Math.max(0, Math.min(2, options?.p ?? 1));
  const d = Math.max(0, Math.min(2, options?.d ?? 1));
  const q = Math.max(0, Math.min(2, options?.q ?? 0));

  const n = series.length;
  const round2 = (v: number) => Math.round(v * 100) / 100;
  const clamp0 = (v: number) => Math.max(0, v);

  // Short series or invalid orders: fallback to linear
  if (n < 5) {
    const last = series[series.length - 1];
    const fc = Array.from({ length: horizon }, () => round2(clamp0(last)));
    return { forecast: fc, lower: [...fc], upper: [...fc], params: { p, d, q } };
  }

  try {
    // Apply differencing
    let diffed = [...series];
    for (let i = 0; i < d; i++) {
      diffed = diffed.slice(1).map((v, idx) => v - diffed[idx]);
    }

    if (diffed.length < p + q + 3) {
      throw new Error('Insufficient data after differencing');
    }

    // Estimate AR coefficients using Yule-Walker (for AR part)
    let arCoeffs: number[] = [];
    if (p > 0) {
      arCoeffs = estimateAR(diffed, p);
    }

    // Compute residuals from AR model
    let residuals: number[] = [];
    if (p > 0) {
      residuals = computeARResiduals(diffed, arCoeffs);
    } else {
      residuals = [...diffed];
    }

    // Estimate MA coefficients using simple method (for MA part)
    let maCoeffs: number[] = [];
    if (q > 0) {
      maCoeffs = estimateMA(residuals, q);
    }

    // Forecast using ARMA model on differenced series
    const diffedForecasts = forecastARMA(diffed, arCoeffs, maCoeffs, horizon);

    // Reverse differencing
    let forecasts = [...diffedForecasts];
    for (let i = 0; i < d; i++) {
      const base = i === 0 ? series[series.length - 1] : forecasts[forecasts.length - 1];
      forecasts = forecasts.map((v, idx) => {
        const prev = idx === 0 ? base : forecasts[idx - 1];
        return prev + v;
      });
    }

    const forecast = forecasts.map(round2).map(clamp0);

    // Bootstrap intervals on original series residuals
    const oneStepResiduals = computeOneStepResiduals(series, p, d, q, arCoeffs, maCoeffs);
    const meanResidual = oneStepResiduals.reduce((s, r) => s + r, 0) / oneStepResiduals.length;
    const centered = oneStepResiduals.map((r) => r - meanResidual);

    const B = 500;
    const rng = mulberry32(42);
    const lower: number[] = [];
    const upper: number[] = [];

    for (let h = 0; h < horizon; h++) {
      const baseF = forecast[h];
      const bootstrapped: number[] = [];
      for (let b = 0; b < B; b++) {
        const idx = Math.floor(rng() * centered.length);
        bootstrapped.push(baseF + centered[idx]);
      }
      bootstrapped.sort((a, b) => a - b);
      lower.push(round2(clamp0(quantile(bootstrapped, 0.025))));
      upper.push(round2(clamp0(quantile(bootstrapped, 0.975))));
    }

    return {
      forecast,
      lower,
      upper,
      params: { p, d, q, coefficients: { ar: arCoeffs, ma: maCoeffs } },
    };
  } catch {
    // Fallback to linear trend
    const { slope, intercept } = linearTrend(series);
    const forecast = Array.from({ length: horizon }, (_, k) => {
      const x = n + k;
      return round2(clamp0(slope * x + intercept));
    });
    return { forecast, lower: [...forecast], upper: [...forecast], params: { p, d, q } };
  }
}

/** Estimate AR(p) coefficients using Yule-Walker equations */
function estimateAR(series: number[], p: number): number[] {
  const n = series.length;
  const mean = series.reduce((s, v) => s + v, 0) / n;
  const centered = series.map((v) => v - mean);

  // Autocovariances
  const gamma: number[] = [];
  for (let k = 0; k <= p; k++) {
    let sum = 0;
    for (let t = k; t < n; t++) {
      sum += centered[t] * centered[t - k];
    }
    gamma.push(sum / n);
  }

  if (gamma[0] === 0) return Array(p).fill(0);

  // Solve Yule-Walker using Levinson-Durbin
  const phi: number[] = [];
  let v = gamma[0];

  for (let k = 1; k <= p; k++) {
    let sum = 0;
    for (let j = 1; j < k; j++) {
      sum += phi[j - 1] * gamma[k - j];
    }
    const kk = (gamma[k] - sum) / v;
    phi.push(kk);

    // Update previous coefficients
    for (let j = 1; j < k; j++) {
      phi[j - 1] = phi[j - 1] - kk * phi[k - j - 1];
    }
    v = v * (1 - kk * kk);
  }

  return phi;
}

/** Compute residuals from AR model */
function computeARResiduals(series: number[], arCoeffs: number[]): number[] {
  const p = arCoeffs.length;
  const residuals: number[] = [];
  for (let t = p; t < series.length; t++) {
    let pred = 0;
    for (let i = 0; i < p; i++) {
      pred += arCoeffs[i] * series[t - 1 - i];
    }
    residuals.push(series[t] - pred);
  }
  return residuals;
}

/** Estimate MA(q) coefficients using method of moments on residuals */
function estimateMA(residuals: number[], q: number): number[] {
  const n = residuals.length;
  if (n === 0) return Array(q).fill(0);

  // Simple innovation algorithm approximation
  const acf: number[] = [];
  const varRes = residuals.reduce((s, v) => s + v * v, 0) / n;
  if (varRes === 0) return Array(q).fill(0);

  for (let k = 1; k <= q; k++) {
    let sum = 0;
    for (let t = k; t < n; t++) {
      sum += residuals[t] * residuals[t - k];
    }
    acf.push(sum / n / varRes);
  }

  // Simple approximation: theta_k ≈ acf_k
  return acf.map((v) => Math.max(-0.99, Math.min(0.99, v)));
}

/** Forecast using ARMA model */
function forecastARMA(
  series: number[],
  arCoeffs: number[],
  maCoeffs: number[],
  horizon: number,
): number[] {
  const p = arCoeffs.length;
  const q = maCoeffs.length;
  const history = [...series];
  const residuals: number[] = Array(q).fill(0);
  const forecasts: number[] = [];

  for (let h = 0; h < horizon; h++) {
    let pred = 0;
    // AR part
    for (let i = 0; i < p; i++) {
      if (history.length > i) {
        pred += arCoeffs[i] * history[history.length - 1 - i];
      }
    }
    // MA part (using past residuals, which are 0 for future)
    for (let j = 0; j < q; j++) {
      if (residuals.length > j) {
        pred += maCoeffs[j] * residuals[residuals.length - 1 - j];
      }
    }
    forecasts.push(pred);
    history.push(pred);
    residuals.push(0); // future residuals assumed 0
  }

  return forecasts;
}

/** Compute one-step-ahead residuals for bootstrap */
function computeOneStepResiduals(
  series: number[],
  _p: number,
  _d: number,
  _q: number,
  _arCoeffs: number[],
  _maCoeffs: number[],
): number[] {
  // Simplified: use linear trend residuals as fallback
  const { slope, intercept } = linearTrend(series);
  return series.map((v, i) => v - (slope * i + intercept));
}

/** Linear trend helper */
function linearTrend(series: number[]): { slope: number; intercept: number } {
  const n = series.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += series[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (series[i] - meanY);
    den += (i - meanX) * (i - meanX);
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}

/**
 * Unified time series forecast wrapper.
 * Returns { forecast, lower, upper, method, params }
 */
export type ForecastMethod = 'holt-damped' | 'ets-aan' | 'arima' | 'auto';

export interface TimeSeriesForecastResult {
  forecast: number[];
  lower: number[];
  upper: number[];
  method: ForecastMethod;
  params: Record<string, unknown>;
}

export function timeSeriesForecast(
  series: number[],
  horizon: number,
  method: ForecastMethod = 'auto',
  options?: Record<string, unknown>,
): TimeSeriesForecastResult {
  const n = series.length;

  // Auto method selection based on series characteristics
  let selectedMethod = method;
  if (method === 'auto') {
    if (n < 10) {
      selectedMethod = 'holt-damped'; // Simple, robust for short series
    } else {
      // Check for trend strength
      const { slope } = linearTrend(series);
      const mean = series.reduce((s, v) => s + v, 0) / n;
      const cv = mean !== 0 ? Math.abs(slope * n / mean) : 0;
      selectedMethod = cv > 0.1 ? 'arima' : 'ets-aan';
    }
  }

  switch (selectedMethod) {
    case 'holt-damped': {
      const result = holtDampedTrendForecast(series, horizon, options as any);
      return { ...result, method: 'holt-damped', params: result.params };
    }
    case 'ets-aan': {
      const result = etsAANForecast(series, horizon, options as any);
      return { ...result, method: 'ets-aan', params: result.params };
    }
    case 'arima': {
      const result = arimaForecast(series, horizon, options as any);
      return { ...result, method: 'arima', params: result.params };
    }
    default:
      return timeSeriesForecast(series, horizon, 'holt-damped', options);
  }
}

/** Expanding-window cross-validation with multiple metrics */
export interface BacktestResult {
  mae: number;
  rmse: number;
  mape: number;
  smape: number;
  mase: number;
  intervalCoverage: number;
  forecasts: Array<{ forecast: number[]; lower: number[]; upper: number[]; actual: number[] }>;
}

export function backtest(
  series: number[],
  holdout: number,
  method: ForecastMethod = 'auto',
  options?: Record<string, unknown>,
): BacktestResult {
  const n = series.length;
  if (n <= holdout + 5) {
    throw new Error('Series too short for backtest with given holdout');
  }

  const forecasts: BacktestResult['forecasts'] = [];
  const errors: number[] = [];
  let coverageCount = 0;
  let totalIntervals = 0;

  // Naive forecast for MASE scaling (seasonal naive with period=1)
  const naiveErrors = series.slice(1).map((v, i) => Math.abs(v - series[i]));
  const maeNaive = naiveErrors.length > 0
    ? naiveErrors.reduce((s, e) => s + e, 0) / naiveErrors.length
    : 1;

  // Expanding window: train on [0..t), test on [t..t+holdout)
  // Run exactly `holdout` folds, anchored to the end of the series so every
  // test window is full-length: t ranges over [n-2h+1, n-h].
  for (let t = n - 2 * holdout + 1; t <= n - holdout; t++) {
    const train = series.slice(0, t);
    const test = series.slice(t, t + holdout);

    const result = timeSeriesForecast(train, holdout, method, options);
    forecasts.push({
      forecast: result.forecast,
      lower: result.lower,
      upper: result.upper,
      actual: test,
    });

    // Compute metrics for this fold
    for (let h = 0; h < holdout; h++) {
      const f = result.forecast[h];
      const a = test[h];
      const err = f - a;
      errors.push(err);

      // Interval coverage
      if (result.lower[h] <= a && a <= result.upper[h]) {
        coverageCount++;
      }
      totalIntervals++;
    }
  }

  const mae = errors.reduce((s, e) => s + Math.abs(e), 0) / errors.length;
  const rmse = Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length);
  const mape = errors.reduce((s, e, i) => {
    const a = forecasts[Math.floor(i / holdout)].actual[i % holdout];
    return s + (a !== 0 ? Math.abs(e / a) : 0);
  }, 0) / errors.length * 100;
  const smape = errors.reduce((s, e, i) => {
    const a = forecasts[Math.floor(i / holdout)].actual[i % holdout];
    const f = forecasts[Math.floor(i / holdout)].forecast[i % holdout];
    return s + (Math.abs(f) + Math.abs(a) > 0 ? Math.abs(e) / ((Math.abs(f) + Math.abs(a)) / 2) : 0);
  }, 0) / errors.length * 100;
  const mase = mae / (maeNaive || 1);
  const intervalCoverage = totalIntervals > 0 ? coverageCount / totalIntervals : 0;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    mae: round2(mae),
    rmse: round2(rmse),
    mape: round2(mape),
    smape: round2(smape),
    mase: round2(mase),
    intervalCoverage: round2(intervalCoverage),
    forecasts,
  };
}

/** Available forecast methods for UI selection */
export const forecastMethods = [
  { key: 'auto', label: 'Auto', description: 'Automatically select best method based on data' },
  { key: 'holt-damped', label: 'Holt Damped', description: 'ETS(A, Ad, N) - damped trend, robust for short series' },
  { key: 'ets-aan', label: 'ETS(A, A, N)', description: 'Additive trend, no damping, good for linear trends' },
  { key: 'arima', label: 'ARIMA', description: 'ARIMA(p,d,q) - flexible for complex patterns' },
] as const;

export default holtDampedTrendForecast;