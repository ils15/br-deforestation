import type { ReactNode } from 'react'

export interface KpiItem {
  label: string
  value: number
  unit?: string
}

export interface KpiGridProps {
  items?: KpiItem[]
  kpis?: KpiItem[]
  children?: ReactNode
  className?: string
  'aria-label'?: string
}

export default function KpiGrid({
  items,
  kpis,
  children,
  className,
  'aria-label': ariaLabel = 'Indicadores',
}: KpiGridProps) {
  const list = items ?? kpis ?? []
  return (
    <div
      className={`kpi-grid ${className ?? ''}`.trim()}
      data-testid="kpi-grid"
      role="group"
      aria-label={ariaLabel}
    >
      {list.map((k, i) => (
        <div key={`${k.label}-${i}`} className="kpi" data-testid="kpi-card">
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value">
            {k.value.toLocaleString('pt-BR')} {k.unit ?? ''}
          </div>
        </div>
      ))}
      {children}
    </div>
  )
}

export { KpiGrid }