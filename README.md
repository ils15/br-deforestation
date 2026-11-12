# BR Deforestation — Painel Pantheon

Dashboard de métricas de desmatamento no Brasil (biomas Amazônia e Cerrado),
com mapas coropléticos por UF, filtros por ano/bioma/estado, KPIs e
projeções lineares rotuladas como estimativa.

## Stack

- React 19 + TypeScript (strict)
- Vite 8 (rolldown) + oxlint
- Vitest + Testing Library + v8 coverage (≥70% em `src/lib` e `src/components`)
- Leaflet / react-leaflet (mapa lazy-loaded)

## Como rodar

```bash
npm ci
npm run dev          # dev server (HMR)
npm run build        # tsc -b && vite build -> dist/
npm run preview      # preview da build
```

## Testes e qualidade

```bash
npm run lint         # oxlint
tsc -b               # typecheck
npm test             # vitest run
npm run coverage     # vitest run --coverage
```

Portões locais antes de commit: `npm run lint && tsc -b && npm test && npm run build`.

## Deploy (GitHub Pages)

```bash
npm run build && npm run deploy   # gh-pages publica dist/ na branch gh-pages
```

O `base` do Vite é `/br-deforestation/`. A URL publicada é
`https://ils15.github.io/br-deforestation/`.

CI (`.github/workflows/ci.yml`) roda em push/PR para `main`: checkout,
setup-node 26, `npm ci`, oxlint, `tsc -b`, `vitest run --coverage`,
`npm run build`.

## Proveniência dos dados

| Fonte | Uso | Observação |
|---|---|---|
| **PRODES/INPE** | Séries históricas de desmatamento (Amazônia, Cerrado), contribuições por UF, MATOPIBA | Dados estáticos commitados em `src/data/deforestation.ts`; release PRODES 2026; valores de 2026 são estimativa (`estimate: true`). |
| **IBGE GeoJSON** | Malha estadual (`public/geo/br-uf.geojson`) para o mapa coroplético | Origem: `geoftp.ibge.gov.br/.../BR_UF_2024.zip` (shapefile SIRGAS 2000), simplificado com mapshaper (~200–400 KB). |
| **SEEG (v14.0, Observatório do Clima)** | Emissões de CO₂e por bioma | Fonte de referência para painel de emissões (planejado/opcional); licença a confirmar; pré-agregar a JSON pequeno antes de commitar. |

## Cadência de atualização

Manual, por release do PRODES (anual, out/nov).

Checklist:

- [ ] Verificar notas de release do PRODES
- [ ] Baixar incrementos PRODES Amazônia + Cerrado
- [ ] Atualizar `amazoniaData` / `cerradoData` / arrays de estados
- [ ] Atualizar agregado SEEG (se usado)
- [ ] Atualizar CSV DETER (se incluído)
- [ ] Ajustar flags `estimate` e data da nota de fonte
- [ ] Rodar `tsc -b && vite build` + smoke test
- [ ] Commit com tag de versão

Responsável: mantenedor único. Automatizar via GitHub Action apenas após 2+ ciclos manuais.

## Estrutura

```
src/
  data/deforestation.ts     # datasets + proveniência
  lib/analytics.ts          # YoY, média móvel, tendência, forecast, correlação
  components/               # painéis, mapa, filtros, KPIs
  context/                  # ThemeContext
public/geo/br-uf.geojson    # malha IBGE simplificada
```

## Licenças de terceiros

- Leaflet 1.9.4 — BSD-2-Clause
- react-leaflet 5.0.0 — Hippocratic-2.1 (não OSI); substituir por Leaflet puro/MapLibre se bloqueado.
EOF
echo done