import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export interface SidebarItem {
  label: string
  key: string
  subitems?: SidebarItem[]
}

export interface SidebarSection {
  label: string
  items: SidebarItem[]
}

export interface SidebarProps {
  activeKey?: string
  onNavigate?: (key: string) => void
  onSelect?: (key: string) => void
  sections?: SidebarSection[]
  groups?: SidebarSection[]
  className?: string
  idPrefix?: string
  footer?: ReactNode
}

export type SidebarGroup = SidebarSection

const DEFAULT_SECTIONS: SidebarSection[] = [
  {
    label: 'Biomas',
    items: [
      { label: 'Amazônia', key: 'Amazônia' },
      { label: 'Cerrado', key: 'Cerrado' },
      { label: 'MATOPIBA', key: 'MATOPIBA' },
      { label: 'Comparativo', key: 'Comparativo' },
    ],
  },
]

const STORAGE_KEY = 'br-deforestation:active-sidebar-key'
const COLLAPSED_STORAGE_KEY = 'br-deforestation:collapsed-sidebar-groups'

function loadActiveKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function loadCollapsedGroups(): string[] {
  try {
    const raw = localStorage.getItem(COLLAPSED_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveCollapsedGroups(groups: string[]): void {
  try {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(groups))
  } catch {
    // ignore storage errors
  }
}

export default function Sidebar({
  activeKey: propActiveKey,
  onNavigate,
  onSelect,
  sections = DEFAULT_SECTIONS,
  groups,
  className,
  idPrefix = '',
  footer,
}: SidebarProps) {
  const effectiveSections = groups ?? sections
  const [activeKey, setActiveKey] = useState<string>(() => loadActiveKey() ?? effectiveSections[0]?.items[0]?.key ?? '')
  const currentActive = propActiveKey ?? activeKey
  const [collapsed, setCollapsed] = useState<string[]>(() => loadCollapsedGroups())
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const asideRef = useRef<HTMLElement | null>(null)

  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const persist = useCallback((key: string) => {
    setActiveKey(key)
    try {
      localStorage.setItem(STORAGE_KEY, key)
    } catch {
      // ignore storage errors
    }
  }, [])

  const toggleGroup = useCallback((label: string) => {
    setCollapsed((prev) => {
      const next = prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
      saveCollapsedGroups(next)
      return next
    })
  }, [])

  const toggleItem = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const isItemExpanded = useCallback(
    (item: SidebarItem) => expanded[item.key] ?? (item.subitems ? true : false),
    [expanded],
  )

  const handleClick = useCallback(
    (item: SidebarItem) => {
      if (item.subitems?.length) {
        toggleItem(item.key)
        return
      }
      persist(item.key)
      if (onNavigate) onNavigate(item.key)
      else onSelect?.(item.key)
    },
    [onNavigate, onSelect, persist, toggleItem],
  )

  // Roving arrow-key navigation across visible sidebar items
  useEffect(() => {
    const aside = asideRef.current
    if (!aside) return

    function handleKeyDown(e: KeyboardEvent) {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
      const visible = Array.from(aside!.querySelectorAll<HTMLButtonElement>('button[data-sidebar-key]')).filter(
        (el) => el.offsetParent !== null,
      )
      if (visible.length === 0) return
      const idx = visible.indexOf(document.activeElement as HTMLButtonElement)
      if (idx === -1) return
      let next = idx
      if (e.key === 'ArrowDown') next = (idx + 1) % visible.length
      else if (e.key === 'ArrowUp') next = (idx - 1 + visible.length) % visible.length
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = visible.length - 1
      e.preventDefault()
      visible[next].focus()
    }

    aside.addEventListener('keydown', handleKeyDown)
    return () => aside.removeEventListener('keydown', handleKeyDown)
  }, [])

  const activeInList = (items: SidebarItem[], key: string): boolean =>
    items.some((i) => i.key === key || activeInList(i.subitems ?? [], key))

  return (
    <aside
      ref={asideRef}
      aria-label="Navegação e filtros"
      data-testid="sidebar"
      className={`flex flex-col gap-2 rounded-lg border border-border bg-surface p-2 ${className ?? ''}`.trim()}
    >
      <nav aria-label="Navegação lateral" className="flex flex-col gap-2">
        {effectiveSections.map((section) => {
        const isOpen = !collapsed.includes(section.label)
        const headerId = `${idPrefix}sidebar-section-${section.label}`
        const testSlug = section.label.replace(/\s+/g, '-')
        return (
          <section key={section.label} className="flex flex-col gap-1">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={headerId}
              onClick={() => toggleGroup(section.label)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              data-testid={`sidebar-section-${testSlug}`}
            >
              <span>{section.label}</span>
              <span aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen && (
              <ul id={headerId} className="flex flex-col gap-1 pl-2">
                {section.items.map((item) => {
                  const hasSubitems = !!item.subitems?.length
                  const subitemsVisible = hasSubitems ? isItemExpanded(item) : false
                  const isActive = item.key === currentActive
                  const subActive = hasSubitems && activeInList(item.subitems ?? [], currentActive)
                  const displayActive = isActive || subActive
                  const itemTestSlug = item.key.replace(/\s+/g, '-')
                  return (
                    <li key={item.key} className="flex flex-col gap-1">
                      <button
                        type="button"
                        ref={(el) => {
                          itemRefs.current[item.key] = el
                        }}
                        data-sidebar-key={item.key}
                        data-testid={`sidebar-item-${itemTestSlug}`}
                        aria-current={isActive ? 'page' : undefined}
                        aria-expanded={hasSubitems ? subitemsVisible : undefined}
                        tabIndex={displayActive ? 0 : -1}
                        onClick={() => handleClick(item)}
                        className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                          displayActive ? 'bg-brand text-brand-foreground' : 'text-text hover:bg-surface-base'
                        }`}
                      >
                        <span className="flex-1 text-left">{item.label}</span>
                        {hasSubitems && (
                          <span aria-hidden="true" className="ml-auto text-xs opacity-70">
                            {subitemsVisible ? '▾' : '▸'}
                          </span>
                        )}
                      </button>
                      {hasSubitems && subitemsVisible && (
                        <ul className="flex flex-col gap-1 pl-4">
                          {item.subitems?.map((sub) => {
                            const isSubActive = sub.key === currentActive
                            const subSlug = sub.key.replace(/\s+/g, '-')
                            return (
                              <li key={sub.key}>
                                <button
                                  type="button"
                                  ref={(el) => {
                                    itemRefs.current[sub.key] = el
                                  }}
                                  data-sidebar-key={sub.key}
                                  data-testid={`sidebar-subitem-${subSlug}`}
                                  aria-current={isSubActive ? 'page' : undefined}
                                  tabIndex={isSubActive ? 0 : -1}
                                  onClick={() => {
                                    persist(sub.key)
                                    onNavigate?.(sub.key)
                                  }}
                                  className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                                    isSubActive ? 'bg-brand text-brand-foreground' : 'text-text hover:bg-surface-base'
                                  }`}
                                >
                                  {sub.label}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
        })}
      </nav>
      {footer && (
        <div className="mt-auto border-t border-border pt-3" data-testid="sidebar-footer">
          {footer}
        </div>
      )}
    </aside>
  )
}
