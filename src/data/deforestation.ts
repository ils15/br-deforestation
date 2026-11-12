export interface YearValue {
  year: number
  km2: number
  estimativa?: boolean
}

export interface StateValue {
  name: string
  km2: number
  pct: number
}

export const amazoniaData: YearValue[] = [
  { year: 2006, km2: 14286 },
  { year: 2007, km2: 11651 },
  { year: 2008, km2: 12911 },
  { year: 2009, km2: 7464 },
  { year: 2010, km2: 7000 },
  { year: 2011, km2: 6418 },
  { year: 2012, km2: 4571 },
  { year: 2013, km2: 5891 },
  { year: 2014, km2: 5012 },
  { year: 2015, km2: 6207 },
  { year: 2016, km2: 7893 },
  { year: 2017, km2: 6947 },
  { year: 2018, km2: 7536 },
  { year: 2019, km2: 10129 },
  { year: 2020, km2: 10851 },
  { year: 2021, km2: 13038 },
  { year: 2022, km2: 11594 },
  { year: 2023, km2: 9064 },
  { year: 2024, km2: 6518 },
  { year: 2025, km2: 5796 },
  { year: 2026, km2: 3335, estimativa: true },
]

export const cerradoData: YearValue[] = [
  { year: 2018, km2: 7259.82 },
  { year: 2019, km2: 6319.02 },
  { year: 2020, km2: 7905.16 },
  { year: 2021, km2: 8531.44 },
  { year: 2022, km2: 10688.73 },
  { year: 2023, km2: 11011.69 },
  { year: 2024, km2: 8174.17 },
  { year: 2025, km2: 7235.27 },
  { year: 2026, km2: 5516.69 },
]

export const amazoniaStates2026: StateValue[] = [
  { name: 'Pará', km2: 1130, pct: 33.9 },
  { name: 'Mato Grosso', km2: 849, pct: 25.5 },
  { name: 'Amazonas', km2: 525, pct: 15.7 },
  { name: 'Roraima', km2: 286, pct: 8.6 },
  { name: 'Acre', km2: 252, pct: 7.6 },
  { name: 'Rondônia', km2: 149, pct: 4.5 },
  { name: 'Maranhão', km2: 128, pct: 3.8 },
  { name: 'Amapá', km2: 8, pct: 0.2 },
  { name: 'Tocantins', km2: 8, pct: 0.2 },
]

export const cerradoStates2026: StateValue[] = [
  { name: 'Maranhão', km2: 1718.59, pct: 31.2 },
  { name: 'Tocantins', km2: 1263.06, pct: 22.9 },
  { name: 'Piauí', km2: 625.24, pct: 11.3 },
  { name: 'Bahia', km2: 489.75, pct: 8.9 },
  { name: 'Minas Gerais', km2: 467.34, pct: 8.5 },
  { name: 'Mato Grosso', km2: 454.52, pct: 8.2 },
  { name: 'Goiás', km2: 210.37, pct: 3.8 },
  { name: 'Mato Grosso do Sul', km2: 208.93, pct: 3.8 },
  { name: 'Pará', km2: 65.9, pct: 1.2 },
  { name: 'Rondônia', km2: 4.92, pct: 0.1 },
  { name: 'Distrito Federal', km2: 4.13, pct: 0.1 },
  { name: 'São Paulo', km2: 3.95, pct: 0.1 },
]
