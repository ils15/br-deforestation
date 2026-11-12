export interface Provenance {
  source?: string
  release?: string
  fetchedAt?: string
}

export interface AmazoniaYear extends Provenance {
  year: number
  km2: number
  estimate?: boolean
}

export interface CerradoYear extends Provenance {
  year: number
  km2: number
  estimate?: boolean
}

export interface StateContribution extends Provenance {
  state: string
  km2: number
  pct: number
}
