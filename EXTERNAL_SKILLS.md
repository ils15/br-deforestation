# External Skills Library — br-deforestation

Curated external skills for the React/Vite dashboard, discovered via `pantheon_skill_search` and ranked via `pantheon_jev_decide`. Install with `npx skills add ... -a opencode`.

## Core / Framework
- **React best practices** — `vercel-labs/agent-skills@vercel-react-best-practices` (893k installs)
  - Purpose: React patterns, performance, and best practices for the dashboard UI.
  - Install: `npx skills add vercel-labs/agent-skills@vercel-react-best-practices -a opencode`

## Build / Tooling
- **Vite** — `antfu/skills@vite` (42k installs)
  - Purpose: Vite config, build, and dev-server guidance.
  - Install: `npx skills add antfu/skills@vite -a opencode`

## Testing
- **Vitest** — `antfu/skills@vitest` (47.8k installs)
  - Purpose: Unit/integration testing with Vitest for dashboard logic.
  - Install: `npx skills add antfu/skills@vitest -a opencode`
- **Webapp testing** — `anthropics/skills@webapp-testing` (203.4k installs)
  - Purpose: End-to-end web app testing workflows.
  - Install: `npx skills add anthropics/skills@webapp-testing -a opencode`

## Data Visualization
- **Recharts** — `andy-spike/skills@recharts` (1.2k installs) — Jev winner for charts
  - Purpose: Recharts chart components and patterns for deforestation metrics.
  - Install: `npx skills add andy-spike/skills@recharts -a opencode`

## Accessibility
- **Accessibility** — `addyosmani/web-quality-skills@accessibility` (69.6k installs)
  - Purpose: WCAG, semantics, keyboard, focus, and ARIA guidance.
  - Install: `npx skills add addyosmani/web-quality-skills@accessibility -a opencode`

## Styling / Design System
- **Tailwind design system** — `wshobson/agents@tailwind-design-system` (73.1k installs)
  - Purpose: Tailwind design-system tokens and component styling.
  - Install: `npx skills add wshobson/agents@tailwind-design-system -a opencode`

## Tool validation
- `pantheon_skill_search`: tested successfully (all entries above verified against the skills registry).
- `pantheon_jev_decide`: tested successfully (used to rank chart skills; `andy-spike/skills@recharts` selected as winner).
