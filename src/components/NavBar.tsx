import type { ReactNode } from 'react'

export interface NavLink {
  label: string
  href?: string
  onClick?: () => void
}

export interface NavBarProps {
  brand?: string
  links?: NavLink[]
  onNavigate?: (label: string) => void
  onMenuClick?: () => void
  onClose?: () => void
  menuOpen?: boolean
  open?: boolean
  className?: string
  children?: ReactNode
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Visão geral', href: '#overview' },
  { label: 'Amazônia', href: '#amazonia' },
  { label: 'Cerrado', href: '#cerrado' },
  { label: 'MATOPIBA', href: '#matopiba' },
  { label: 'Comparativo', href: '#comparativo' },
  { label: 'Mapa', href: '#mapa' },
]

export default function NavBar({
  brand = 'Desmatamento — Brasil',
  links = DEFAULT_LINKS,
  onNavigate,
  onMenuClick,
  onClose,
  menuOpen,
  open,
  className,
  children,
}: NavBarProps) {
  const menuState = menuOpen ?? open ?? false
  const handleMenuClick = () => {
    if (menuState) {
      onClose?.()
    } else {
      onMenuClick?.()
    }
  }
  return (
    <nav
      aria-label="Navegação principal"
      data-testid="navbar"
      className={`flex items-center justify-between gap-4 ${className ?? ''}`.trim()}
    >
      <a
        href="/"
        data-testid="brand"
        className="flex items-center gap-2 text-lg font-semibold text-text-heading no-underline"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
          BR
        </span>
        <span>{brand}</span>
      </a>

      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md border border-border bg-surface p-2 text-text lg:hidden"
        aria-label={menuState ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuState}
        aria-controls="mobile-drawer"
        onClick={handleMenuClick}
        data-testid="menu-button"
      >
        <span aria-hidden="true">{menuState ? '✕' : '☰'}</span>
      </button>

      <ul className="hidden items-center gap-1 lg:flex" data-testid="nav-links">
        {links.map((link) => (
          <li key={link.label}>
            {onNavigate || link.onClick ? (
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm text-text transition-colors hover:bg-surface hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={() => {
                  link.onClick?.()
                  onNavigate?.(link.label)
                }}
              >
                {link.label}
              </button>
            ) : (
              <a
                href={link.href ?? '#'}
                className="rounded-md px-3 py-2 text-sm text-text transition-colors hover:bg-surface hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      {children}
    </nav>
  )
}