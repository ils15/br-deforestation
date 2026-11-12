# Phase 1 — Discovery & Data Contract

## 1) React 19 + react-leaflet v5 compatibility
- react-leaflet 5.0.0 peer deps: react ^19.0.0, react-dom ^19.0.0, leaflet ^1.9.0 → compatible with React 19.3.1. @react-leaflet/core ^3.0.0 is a regular dependency (not peer).
- leaflet 1.9.4 (BSD-2-Clause), ~40KB gz JS + CSS 14.8KB uncompressed / ~3.6KB gz.
- License caveat: react-leaflet Hippocratic-2.1 (not OSI). If blocked, use raw Leaflet or MapLibre.
- Recommendation: adopt only if map view in scope; bundle +45KB gz (JS ~40KB gz + CSS ~3.6KB gz + core). Alternative: skip (YAGNI).

## 2) IBGE GeoJSON state boundaries
- Source: geoftp.ibge.gov.br/.../BR_UF_2024.zip (14MB shapefile, SIRGAS 2000).
- Simplify with mapshaper: `mapshaper BR_UF_2024.shp -simplify 5% keep-shapes -o format=geojson br-uf.geojson` → target <500KB (expect 200-400KB).
- Ship simplified GeoJSON in public/ or src/data/, lazy-load. Never bundle 14MB.

## 3) Emissions (CO2e)
- Source: SEEG v14.0 (Climate Observatory), national XLSX + municipal CSVs (Google Drive) + CO2e summary XLSX.
- URLs: seeg.eco.br/english/seeg-data/
- Format XLSX/CSV; filter by biome & LULUCF. License ❓ (citation required; no explicit CC found). Size ❓ (tens of MB).
- Recommendation: pre-aggregate to small JSON (biome × year × CO2e) at build time; do not ship raw XLSX.

## 4) DETER alerts
- Source: INPE TerraBrasilis WFS (deter-amz, deter-cerrado-nb (layer `deter_cerrado`)) + shapefile downloads.
- Feasibility: annual aggregates by state via WFS CQL filters or pre-aggregation scripts; raw shapefiles large & daily.
- License/size ❓ (Brazilian public data; no explicit license found).
- Recommendation: if included, ship only pre-computed annual state-level CSV (<100KB), refreshed per PRODES release; no geometries.

## 5) MATOPIBA
- States: MA, TO, PI, BA (subset of Cerrado states already in data).
- Historical series available via PRODES Cerrado (since 2000) + TerraBrasilis per-state. PRODES Cerrado was biannual 2000-2012 and annual from 2013; state-level granularity effectively post-2018.
- Recommendation: derive MATOPIBA KPI/series from existing Cerrado state data; no new source. ❓ pre-2018 state granularity may vary by release.

## 6) Tailwind adoption
- Not installed; only skill present. Current styling = CSS vars (235 lines).
- Recommendation: keep CSS vars now (YAGNI). Reconsider Tailwind only if component count grows or shadcn adopted.

## 7) zod adoption
- Not installed; data is static TS arrays, no untrusted runtime input.
- Recommendation: skip now. Add zod/v4-mini only at external data boundaries (SEEG/TerraBrasilis runtime fetch).

## 8) Update cadence & ownership
- Cadence: manual per PRODES release (annual, Oct/Nov, BiomasBR notes).
- Checklist: check release notes; download PRODES Amazon+Cerrado increments; update amazoniaData/cerradoData/state arrays; refresh SEEG aggregate; refresh DETER CSV if included; update estimativa flags + source-note date; tsc -b && vite build + smoke test; commit with version tag.
- Owner: single maintainer (document in README); automate via GitHub Action only after 2+ manual cycles.

## Data Contract (deferred to Phase 2)

Sketch (TypeScript), to be finalized in Phase 2:

```ts
interface Provenance {
  source: string;        // e.g. "PRODES Amazonia"
  release: string;       // PRODES release identifier
  fetchedAt: string;     // ISO date
}

interface AmazoniaYear extends Provenance {
  year: number;
  km2: number;
  estimate?: boolean;
}

interface CerradoYear extends Provenance {
  year: number;
  km2: number;
  estimate?: boolean;
}

interface StateContribution extends Provenance {
  state: string;         // UF code
  km2: number;
  pct: number;
}
```

Provenance note: existing `amazoniaData`/`cerradoData` provenance (PRODES release, estimate basis) is unknown and must be verified.

## Unknowns (resolve before Phase 2)
- Provenance of existing amazoniaData/cerradoData (PRODES release, estimate basis).
- Exact GeoJSON source/simplification pipeline.
- Emissions dataset endpoint & license.
- DETER inclusion decision.
- Tailwind adoption decision.
- zod adoption.
- Update cadence/ownership.
