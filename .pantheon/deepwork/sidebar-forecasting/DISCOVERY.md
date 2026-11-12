# Phase 1 — Discovery & Research (Bifrost)

## Superseded recommendations (approved decisions)

- Navigation: top nav removed completely; compact header may remain but no primary links in header. (supersedes §3 recommendation of compact header)
- Forecasting: implement all three methods (Holt damped, ETS, ARIMA) with model selector in UI. (supersedes §2 primary-only recommendation)
- Filters: in sidebar footer.
- Model selector: yes, expose in UI.

## 1. Sidebar navigation patterns (data dashboards)
- Layout: persistent left sidebar 200–280px (expanded) / 48–72px (collapsed icon-only) with tooltips + aria-label; mobile overlay drawer 240–320px (≤85vw). Animate width only (200ms ease-in-out).
- Groups: collapsible sections with header button (aria-expanded, aria-controls) or native <details>/<summary>. Indent level-2. Dividers. Keep essentials out of collapsed groups.
- Active state: visual highlight (bg ~8% primary + 3px left accent, bold) AND semantic aria-current="page". Never color alone.
- Keyboard: Tab between groups/items (or roving tabindex + arrows if role="tree"). Enter/Space activates; Escape collapses drawer/group. Home/End optional. Visible focus ring.
- ARIA: sidebar landmark <nav aria-label="Navegação principal"> (or aside+nav). Collapsible header aria-expanded/aria-controls. Collapse toggle aria-expanded/aria-controls. Icon-only: aria-label + tooltip. Mobile drawer: role="dialog", aria-modal="true", focus trap, Escape, restore focus (existing MobileDrawer).
- Persistence: localStorage for expanded/collapsed groups + sidebar collapsed state.
- Responsive: mini on tablet; drawer on mobile with hamburger. Keep SkipLink.
- Filters: place in sidebar footer (approved decision); keep collapsible if space constrained.
- Iconography: lucide-react is not installed; use inline SVG or emoji and keep dependencies minimal.
- Pattern choice: sidebar wins for >=8-10 sections/deep hierarchy; top nav fine for <=5-7. Clarify section count: App renders 4 tabs (Amazônia, Cerrado, MATOPIBA, Comparativo); NavBar has 6 default links (incl. Visão geral, Mapa); sidebar IA should cover sections, not links. User wants sidebar.
- ARIA tree caveat: MDN/W3C warn role="tree" is app-like (arrow-key primary, not Tab) and unusual for web content. Recommend simpler grouped-list pattern (nav > ul > li with aria-expanded/aria-current) unless true hierarchical selection needed. Reserve role="tree" only if nested grouping with arrow-key nav desired.

Sources: W3C APG Tree View + Navigation Treeview; MDN treeitem/tree roles; Accessible data interfaces; UX patterns sidebar (thedaviddias, thefrontkit, artofstyleframe); Flux/CoreUI/Vielzeug collapsible sidebars; MUI Toolpad DashboardLayout.

## 2. Time-series forecasting for short annual environmental series

### Method comparison
- SES (ETS(A,N,N)): level only; too naive for trended deforestation.
- Holt's linear trend (ETS(A,A,N)): additive trend; tends to overshoot at longer horizons.
- Damped Holt's (ETS(A,Ad,N)): trend multiplied by phi each step; forecasts asymptote to finite level; RECOMMENDED DEFAULT for environmental data where trends slow. M4: damped ranked better (sMAPE 12.661 vs Holt 13.775). Gardner & McKenzie: damping helped even short horizons.
- Holt-Winters / ETS with seasonality: not applicable (annual data, m=1, no seasonality). Skip.
- ARIMA: good for short-run autocorrelation; needs >=~10 obs and order selection (p,d,q); more complex, no clear gain for trended annual series. Now required (implement all three methods incl. ARIMA) with model selector in UI; see ARIMA risk assessment. arima npm is WASM-based and heavy; prefer pure-TS or dynamic import.

### ARIMA risk assessment
- arima npm ships ~239KB WASM; Chrome/V8 imposes a small synchronous compile limit (treat as ~4KB per task note) and requires async/dynamic loading; .destroy() lifecycle must be managed to avoid leaks.
- Browser/Vite WASM: larger bundle, async init, potential CSP (wasm-unsafe-eval) and build-config concerns.
- Pure-TS implementation effort: moderate; small orders (p,d,q <= 2) feasible with differencing + order selection (AICc); no optimizer dep.
- Recommendation: implement pure-TS ARIMA for small orders; optionally dynamic-import the wasm build with fallback to pure-TS; if blocked, mark unknown and defer to pure-TS only.
- Unknown: whether WASM dynamic import is permitted under current Vite/build constraints; if blocked, treat as unknown.

### Recommended defaults
- Default model: damped Holt's (ETS(A,Ad,N)), additive errors, no seasonality; model selector exposes all three methods (damped Holt, ETS, ARIMA).
- Damping phi in [0.8, 0.98]; default phi = 0.9 (ETS() default range). Below 0.8 over-damps; above 0.98 indistinguishable from Holt.
- Smoothing: alpha (level) in [0.01,0.99], beta (trend) in [0.01,0.99]. Estimate by minimizing one-step SSE via grid search (pure TS, no optimizer dep) with bounds; fall back to alpha=0.2, beta=0.1, phi=0.9 when n < 5.
- Model selection among SES/Holt/damped-Holt via AICc for n small; report chosen method + params.
- Annual data -> m=1, no seasonal component. If future monthly/quarterly data arrives, revisit (Holt-Winters + SARIMA).
- Short-series handling: require n >= 3 for Holt; if n < 5 use SES or naive/drift; if n < 3 return empty/NaN-guarded. Cerrado has 9 points -> Holt feasible but high variance; backtesting decides.
- Negative clamping: clamp point forecasts and interval bounds to >= 0 (deforestation km2 cannot be negative). Round to 2 decimals (match existing forecast).
- Prediction intervals: bootstrap residual resampling (B=500-1000) using in-sample one-step residuals; quantiles (0.10,0.90) for 80%, (0.025,0.975) for 95%. Alternative: closed-form ETS state-space variance (complex; bootstrap is robust and simpler). Clamp lower bound at 0.
- Backtesting: expanding-window time-series CV (origin starting ~max(8, floor(n/2))); evaluate 1-step and h-step; metrics MAE, RMSE, MAPE, sMAPE, MASE; interval coverage at 80/95. Report honestly; small n -> wide intervals.
- Pure TS implementation notes: implement damped Holt's recurrence:
  - level_t = alpha*y_t + (1-alpha)*(level_{t-1} + phi*trend_{t-1})
  - trend_t = beta*(level_t - level_{t-1}) + (1-beta)*phi*trend_{t-1}
  - forecast_{t+h} = level_t + trend_t*(phi + phi^2 + ... + phi^h) = level_t + trend_t*phi*(1-phi^h)/(1-phi)
  - Initialization: level_0 = y_1 (or mean of first few), trend_0 = (y_n-y_1)/(n-1) (or regression slope). Handle n=1.
  - Keep existing linearTrend/forecast unchanged for backward compat; add new functions (e.g. dampedHoltForecast, etsAANdForecast, predictionIntervals) to avoid breaking analytics.test.ts. Update tests only in implementation phase.

### Unknowns (forecasting)
- Whether forecasting should replace or augment the existing linear forecast (tests pin linear output). Recommend augment + keep linear.
- Preferred interval method (bootstrap vs analytic) and B; bootstrap cost acceptable (B=500).
- [RESOLVED] Model selector: yes, expose in UI (approved decision); implement all three methods (Holt damped, ETS, ARIMA) with model selector.
- Whether 2026 estimate points should be excluded from fitting; recommend fit all (including estimate) but allow fitThroughYear option. Unknown preference.

Sources: FPP3 (Hyndman & Athanasopoulos); Berkeley ETS lecture; Gardner & McKenzie "Forecasting Trends"; M4 competition; Holt's method tutorial; exponential smoothing practical tips; arima npm; TypeScript Holt-Winters reference (theAlgorithmist).

## 3. Top nav: fully removed vs compact header
Recommendation: do NOT fully remove the header. Remove the top navigation links bar, keep a compact app header.

Evidence: Dashboard pattern guidance: sidebars own primary destinations; a header/top app bar still owns current-view title, navigation affordance (hamburger), and global actions (search, account, overflow). Removing all header loses orientation and breaks bypass-blocks/landmark expectations (WCAG 2.4.1). Nielsen/NN/g + Art of Styleframe: top nav fine for <=5-7 sections; past ~10, sidebar wins. Clarify section count: App renders 4 tabs; NavBar has 6 default links; sidebar IA should cover sections, not links. Material top app bar spec: title + nav icon + actions + overflow; collapsing/hiding on scroll must keep title/back recovery predictable. AdminLTE/Linear: "classic sidebar + top bar for search/user/actions" default; "minimal top-nav" (Linear) only when very few sections and keyboard-centric.

Proposed shape: Compact header (48-56px): brand mark + app title (or current section title) + hamburger (mobile) + optional global actions (theme/filter reset) + user/account. No primary destination links (those live in sidebar/drawer). Sidebar (desktop) / drawer (mobile) holds the 4 sections (tabs) + collapsible groups; not NavBar's 6 default links. Keep SkipLink targeting #main-content. If user insists on fully removing header: use floating hamburger + sidebar brand, but this hurts orientation and is not recommended; flag as decision.

Unknowns: [RESOLVED] Navigation: top nav removed completely; compact header may remain but no primary links in header (approved decision). Whether global actions (search, theme) exist to justify a header; currently none beyond brand. If none, header can be very minimal (brand + hamburger only).

Sources: Header vs global nav vs bottom nav (uxpatternsguide); Header/top app bar pattern; Dashboard design patterns 2026 (artofstyleframe); Admin dashboard layouts (adminlte); SaaS nav (saasui); Material top app bar/nav bar.

## Cross-cutting recommendations
1. Keep changes incremental: add sidebar component reusing MobileDrawer; keep NavBar props but mark deprecated; avoid breaking existing tests.
2. Accessibility first: reuse existing focus-trap drawer; add aria-current, group aria-expanded, skip link, roving tabindex only if tree role chosen.
3. Forecasting: augment analytics.ts (don't replace forecast); add damped Holt + intervals + backtesting helpers; pure TS, no new deps; clamp >=0.
4. Clarify with user: forecasting API expectations, whether 2026 estimate points included in fit. (Header scope resolved: top nav removed completely; compact header may remain without primary links.)
DISCOVERY
