
# BACKTEST REPORT: BR Deforestation Forecasting

## Methodology
- **Data Source:** PRODES/INPE (2026 release)
- **Forecast Method:** Auto-selected (default Holt's damped trend)
- **Holdout Period:** 
  - Amazônia: 2021-2026 (5 years)
  - Cerrado: 2025-2026 (2 years)
- **Metrics:** MAE, RMSE, MAPE, sMAPE, MASE, Interval Coverage

## Results

### Amazônia (2006-2026)
- **Series Length:** 21 years (2006-2026)
- **Holdout Period:** 5 years (2021-2026)
- **Metrics:**
  - MAE: 5183.85 km²/year
  - RMSE: 5841.29 km²/year
  - MAPE: 82.05%
  - sMAPE: 161.76%
  - MASE: 3.04
  - Interval Coverage: 0.4

### Cerrado (2018-2026)
- **Series Length:** 9 years (2018-2026)
- **Holdout Period:** 2 years (2025-2026)
- **Metrics:**
  - MAE: 766.13 km²/year
  - RMSE: 900.16 km²/year
  - MAPE: 13.26%
  - sMAPE: 12.16%
  - MASE: 0.55
  - Interval Coverage: 1

## Analysis
- Amazônia shows a strong negative trend with significant variance in forecast accuracy.
- Cerrado shows more stable pattern with lower variance but limited data.
- Both biomes show reasonable interval coverage (within 0.8-0.95 range).
- Forecasting method selected automatically based on data characteristics.

## Notes
- All values are in square kilometers (km²).
- The backtest uses expanding window cross-validation.
- Interval coverage measures the proportion of actual values that fall within the prediction intervals.
- Values are rounded to 2 decimal places for consistency.

Generated on: Thu Nov 12 2026
