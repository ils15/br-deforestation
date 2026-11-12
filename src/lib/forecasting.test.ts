import { describe, it, expect } from 'vitest';
import {
  holtDampedTrendForecast,
  etsAANForecast,
  arimaForecast,
  timeSeriesForecast,
  backtest,
  forecastMethods,
} from './forecasting';

describe('holtDampedTrendForecast', () => {
  it('golden: linear series with defaults', () => {
    const result = holtDampedTrendForecast([1, 2, 3, 4, 5], 2);
    expect(result.params).toEqual({ alpha: 0.2, beta: 0.1, phi: 0.9 });
    expect(result.forecast).toHaveLength(2);
    expect(result.lower).toHaveLength(2);
    expect(result.upper).toHaveLength(2);
    expect(result.forecast[0]).toBeGreaterThan(5);
    expect(result.forecast[0]).toBeLessThan(8);
    expect(result.forecast[1]).toBeGreaterThan(5);
    expect(result.forecast[1]).toBeLessThan(10);
  });

  it('golden: short series fallback to naive', () => {
    const result = holtDampedTrendForecast([10, 12], 3);
    expect(result.forecast).toEqual([12, 12, 12]);
    expect(result.lower).toEqual([12, 12, 12]);
    expect(result.upper).toEqual([12, 12, 12]);
  });

  it('golden: custom params respected', () => {
    const result = holtDampedTrendForecast([1, 2, 3, 4, 5], 1, {
      alpha: 0.5,
      beta: 0.3,
      phi: 0.95,
    });
    expect(result.params).toEqual({ alpha: 0.5, beta: 0.3, phi: 0.95 });
    expect(result.forecast).toHaveLength(1);
  });

  it('golden: clamps negatives to 0', () => {
    const result = holtDampedTrendForecast([-1, -2, -3, -4, -5], 2);
    expect(result.forecast.every((v) => v >= 0)).toBe(true);
    expect(result.lower.every((v) => v >= 0)).toBe(true);
    expect(result.upper.every((v) => v >= 0)).toBe(true);
  });

  it('golden: intervals contain forecast', () => {
    const result = holtDampedTrendForecast([1, 2, 3, 4, 5], 3);
    for (let i = 0; i < result.forecast.length; i++) {
      expect(result.lower[i]).toBeLessThanOrEqual(result.forecast[i]);
      expect(result.upper[i]).toBeGreaterThanOrEqual(result.forecast[i]);
    }
  });
});

describe('etsAANForecast', () => {
  it('golden: linear series with defaults', () => {
    const result = etsAANForecast([1, 2, 3, 4, 5], 2);
    expect(result.params).toEqual({ alpha: 0.2, beta: 0.1 });
    expect(result.forecast).toHaveLength(2);
    expect(result.lower).toHaveLength(2);
    expect(result.upper).toHaveLength(2);
    expect(result.forecast[0]).toBeGreaterThan(5);
  });

  it('golden: short series fallback to naive', () => {
    const result = etsAANForecast([10, 12], 3);
    expect(result.forecast).toEqual([12, 12, 12]);
    expect(result.lower).toEqual([12, 12, 12]);
    expect(result.upper).toEqual([12, 12, 12]);
  });
});

describe('arimaForecast', () => {
  it('golden: simple case', () => {
    const result = arimaForecast([1, 2, 3, 4, 5], 1, { p: 1, d: 0, q: 0 });
    expect(result.forecast).toHaveLength(1);
    expect(result.lower).toHaveLength(1);
    expect(result.upper).toHaveLength(1);
    expect(result.params.p).toBe(1);
    expect(result.params.d).toBe(0);
    expect(result.params.q).toBe(0);
  });

  it('fallback to linear when fails', () => {
    const result = arimaForecast([1, 2], 1, { p: 2, d: 1, q: 1 }); // Should fail and fallback
    expect(result.forecast).toHaveLength(1);
  });
});

describe('timeSeriesForecast', () => {
  it('routes to correct method', () => {
    const result = timeSeriesForecast([1, 2, 3, 4, 5], 2, 'holt-damped');
    expect(result.method).toBe('holt-damped');
    expect(result.forecast).toHaveLength(2);
  });

  it('routes to ets-aan', () => {
    const result = timeSeriesForecast([1, 2, 3, 4, 5], 2, 'ets-aan');
    expect(result.method).toBe('ets-aan');
    expect(result.forecast).toHaveLength(2);
  });

  it('routes to arima', () => {
    const result = timeSeriesForecast([1, 2, 3, 4, 5], 2, 'arima', { p: 1, d: 0, q: 0 });
    expect(result.method).toBe('arima');
    expect(result.forecast).toHaveLength(2);
  });

  it('auto selection', () => {
    const result = timeSeriesForecast([1, 2, 3, 4, 5], 2, 'auto');
    expect(['holt-damped', 'ets-aan', 'arima']).toContain(result.method);
  });
});

describe('forecastMethods', () => {
  it('contains all methods', () => {
    expect(forecastMethods).toHaveLength(4);
    expect(forecastMethods.map(m => m.key)).toEqual(['auto', 'holt-damped', 'ets-aan', 'arima']);
  });

  it('has descriptions', () => {
    expect(forecastMethods[0].description).toBeDefined();
  });
});

describe('backtest', () => {
  it('returns correct metrics', () => {
    const series = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = backtest(series, 2, 'holt-damped');
    
    expect(result.mae).toBeDefined();
    expect(result.rmse).toBeDefined();
    expect(result.mape).toBeDefined();
    expect(result.smape).toBeDefined();
    expect(result.mase).toBeDefined();
    expect(result.intervalCoverage).toBeDefined();
    expect(result.forecasts).toHaveLength(2);
    
    // Check that forecasts are valid
    expect(result.forecasts[0].forecast).toHaveLength(2);
    expect(result.forecasts[0].lower).toHaveLength(2);
    expect(result.forecasts[0].upper).toHaveLength(2);
    expect(result.forecasts[0].actual).toHaveLength(2);
    
    // Check interval coverage
    expect(result.intervalCoverage).toBeLessThanOrEqual(1);
    expect(result.intervalCoverage).toBeGreaterThanOrEqual(0);
  });
});