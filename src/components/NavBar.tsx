import type { ReactNode } from 'react'
import MobileDrawer from './MobileDrawer'

export interface NavLink {
  label: string
  href?: string
  onClick?: () => void
  isActive?: boolean
}

export interface NavBarProps {
  brand?: string
  brandMark?: string
  links?: NavLink[]
  onNavigate?: (label: string) => void
  onMenuClick?: () => void
  onClose?: () => void
  onSearch?: () => void
  onThemeReset?: () => void
  menuOpen?: boolean
  open?: boolean
  actions?: ReactNode
  mobileMenu?: ReactNode
  children?: ReactNode
  className?: string
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
  brandMark = 'BR',
  links = DEFAULT_LINKS,
  onNavigate,
  onMenuClick,
  onClose,
  onSearch,
  onThemeReset,
  menuOpen,
  open,
  actions,
  mobileMenu,
  children,
  className,
}: NavBarProps) {
  const menuState = menuOpen ?? open ?? false
  const navId = 'nav-links'

  const handleMenuClick = () => {
    if (menuState) {
      onClose?.()
    } else {
      onMenuClick?.()
    }
  }

  const renderLink = (link: NavLink) => {
    const hasAction = Boolean(onNavigate || link.onClick)
    const isActive = Boolean(link.isActive)
    const commonProps = {
      href: link.href ?? '#',
      className:
        'rounded-md px-3 py-2 text-sm text-text transition-colors hover:bg-surface hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    }
    if (hasAction) {
      return (
        <button
          type="button"
          {...commonProps}
          aria-current={isActive ? 'page' : undefined}
          onClick={(event) => {
            event.preventDefault()
            link.onClick?.()
            onNavigate?.(link.label)
          }}
        >
          {link.label}
        </button>
      )
    }
    return (
      <a {...commonProps} aria-current={isActive ? 'page' : undefined}>
        {link.label}
      </a>
    )
  }

  const renderMobileLink = (link: NavLink) => (
    <button
      key={link.label}
      type="button"
      aria-current={link.isActive ? 'page' : undefined}
      className="w-full rounded-md px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      onClick={() => {
        link.onClick?.()
        onNavigate?.(link.label)
      }}
    >
      {link.label}
    </button>
  )

  const defaultActions = (
    <>
      <button
        type="button"
        data-testid="search-button"
        aria-label="Buscar"
        onClick={onSearch}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-surface hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        🔍 <span className="sr-only">Buscar</span>
      </button>
      <button
        type="button"
        data-testid="theme-reset-button"
        aria-label="Redefinir tema"
        onClick={onThemeReset}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-surface hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        🔄 <span className="sr-only">Redefinir tema</span>
      </button>
    </>
  )

  return (
    <nav
      aria-label="Navegação principal"
      data-testid="navbar"
      className={`flex flex-wrap items-center gap-4 ${className ?? ''}`.trim()}
    >
      <a
        href="/"
        data-testid="brand"
        className="flex items-center gap-2 text-lg font-semibold text-text-heading no-underline"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground font-bold">
          {brandMark}
        </span>
        <span>{brand}</span>
      </a>

      <ul
        id={navId}
        data-testid="nav-links"
        aria-expanded={menuState}
        aria-label="Links de navegação"
        className="hidden items-center gap-1 lg:flex lg:flex-1 lg:justify-center"
      >
        {links.map(renderLink)}
      </ul>

            <MobileDrawer
        open={menuState}
        onClose={() => onClose?.()}
        title="Menu"
      >
        <nav aria-label="Navegação mobile" className="flex flex-col gap-1">
          {mobileMenu ?? links.map(renderMobileLink)}
        </nav>
      </MobileDrawer>

      <div
        data-testid="nav-actions"
        className="hidden items-center gap-2 lg:flex lg:ml-auto"
      >
        {actions ?? children ?? defaultActions}
      </div>

      <button
        type="button"
        data-testid="menu-button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-surface hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
        aria-label={menuState ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuState}
        aria-controls={navId}
        onClick={handleMenuClick}
      >
        <span aria-hidden="true">{menuState ? '✕' : '☰'}</span>
      </button>
    </nav>
  )
}
