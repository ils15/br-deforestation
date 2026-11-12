import type { AmazoniaYear, CerradoYear, StateContribution } from '../types/data'

const PROVENANCE = {
  source: 'PRODES/INPE',
  release: '2026',
  fetchedAt: '2026-11-12',
} as const

export const amazoniaData: AmazoniaYear[] = [
  { year: 2006, km2: 14286, ...PROVENANCE },
  { year: 2007, km2: 11651, ...PROVENANCE },
  { year: 2008, km2: 12911, ...PROVENANCE },
  { year: 2009, km2: 7464, ...PROVENANCE },
  { year: 2010, km2: 7000, ...PROVENANCE },
  { year: 2011, km2: 6418, ...PROVENANCE },
  { year: 2012, km2: 4571, ...PROVENANCE },
  { year: 2013, km2: 5891, ...PROVENANCE },
  { year: 2014, km2: 5012, ...PROVENANCE },
  { year: 2015, km2: 6207, ...PROVENANCE },
  { year: 2016, km2: 7893, ...PROVENANCE },
  { year: 2017, km2: 6947, ...PROVENANCE },
  { year: 2018, km2: 7536, ...PROVENANCE },
  { year: 2019, km2: 10129, ...PROVENANCE },
  { year: 2020, km2: 10851, ...PROVENANCE },
  { year: 2021, km2: 13038, ...PROVENANCE },
  { year: 2022, km2: 11594, ...PROVENANCE },
  { year: 2023, km2: 9064, ...PROVENANCE },
  { year: 2024, km2: 6518, ...PROVENANCE },
  { year: 2025, km2: 5796, ...PROVENANCE },
  { year: 2026, km2: 3335, estimate: true, ...PROVENANCE },
]

export const cerradoData: CerradoYear[] = [
  { year: 2018, km2: 7259.82, ...PROVENANCE },
  { year: 2019, km2: 6319.02, ...PROVENANCE },
  { year: 2020, km2: 7905.16, ...PROVENANCE },
  { year: 2021, km2: 8531.44, ...PROVENANCE },
  { year: 2022, km2: 10688.73, ...PROVENANCE },
  { year: 2023, km2: 11011.69, ...PROVENANCE },
  { year: 2024, km2: 8174.17, ...PROVENANCE },
  { year: 2025, km2: 7235.27, ...PROVENANCE },
  { year: 2026, km2: 5516.69, estimate: true, ...PROVENANCE },
]

export const MAP_DATA_YEAR = 2026

export const amazoniaStates2026: StateContribution[] = [
  { state: 'Pará', km2: 1130, pct: 33.9, ...PROVENANCE },
  { state: 'Mato Grosso', km2: 849, pct: 25.5, ...PROVENANCE },
  { state: 'Amazonas', km2: 525, pct: 15.7, ...PROVENANCE },
  { state: 'Roraima', km2: 286, pct: 8.6, ...PROVENANCE },
  { state: 'Acre', km2: 252, pct: 7.6, ...PROVENANCE },
  { state: 'Rondônia', km2: 149, pct: 4.5, ...PROVENANCE },
  { state: 'Maranhão', km2: 128, pct: 3.8, ...PROVENANCE },
  { state: 'Amapá', km2: 8, pct: 0.2, ...PROVENANCE },
  { state: 'Tocantins', km2: 8, pct: 0.2, ...PROVENANCE },
]

export const cerradoStates2026: StateContribution[] = [
  { state: 'Maranhão', km2: 1718.59, pct: 31.2, ...PROVENANCE },
  { state: 'Tocantins', km2: 1263.06, pct: 22.9, ...PROVENANCE },
  { state: 'Piauí', km2: 625.24, pct: 11.3, ...PROVENANCE },
  { state: 'Bahia', km2: 489.75, pct: 8.9, ...PROVENANCE },
  { state: 'Minas Gerais', km2: 467.34, pct: 8.5, ...PROVENANCE },
  { state: 'Mato Grosso', km2: 454.52, pct: 8.2, ...PROVENANCE },
  { state: 'Goiás', km2: 210.37, pct: 3.8, ...PROVENANCE },
  { state: 'Mato Grosso do Sul', km2: 208.93, pct: 3.8, ...PROVENANCE },
  { state: 'Pará', km2: 65.9, pct: 1.2, ...PROVENANCE },
  { state: 'Rondônia', km2: 4.92, pct: 0.1, ...PROVENANCE },
  { state: 'Distrito Federal', km2: 4.13, pct: 0.1, ...PROVENANCE },
  { state: 'São Paulo', km2: 3.95, pct: 0.1, ...PROVENANCE },
]
