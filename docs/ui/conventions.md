# UI conventions

## Stack

- React 19.3 with strict TypeScript 7, built by Vite 8.
- Tailwind CSS 4 utility classes plus `src/index.css` for shared layout and controls; design tokens live in `src/styles/tokens.css`.
- Recharts 3.10 for responsive time-series and comparison visualizations; Leaflet 1.9 with React Leaflet 5 for the map.
- Vitest and React Testing Library for component behavior tests.

## Patterns

- `App.tsx` owns dashboard filters, active biome, and the responsive shell; reusable navigation, filter, chart, and map UI stays in `src/components`.
- Desktop primary navigation and filters live in the sidebar. The mobile menu uses one modal drawer containing the same navigation and filter controls.
- Dashboard content uses mobile-first single-column layout and `minmax(0, …)` grid tracks for chart/map sizing; the map stacks below charts until the wide desktop breakpoint.
- The state contribution map is fixed to PRODES/INPE 2026 state data; chart year filters must not relabel or imply a different map period.
- Keep chart and forecast calculations in their existing data/lib modules; presentation changes must not alter forecast behavior.
- Interactive controls use semantic elements, visible focus states, accessible labels, and keyboard navigation. Keep IDs unique when responsive desktop/mobile instances coexist.
- Use `data-testid` only where tests need a stable user-flow target; assert behavior with React Testing Library rather than snapshots.
