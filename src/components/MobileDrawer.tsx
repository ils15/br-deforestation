import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export interface MobileDrawerProps {
  open?: boolean
  isOpen?: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function MobileDrawer({
  open,
  isOpen,
  onClose,
  title = 'Menu',
  children,
  className,
}: MobileDrawerProps) {
  const openState = open ?? isOpen ?? false
  const drawerRef = useRef<HTMLElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!openState) return
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null
    const drawer = drawerRef.current
    if (!drawer) return

    const getFocusable = () =>
      Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE))

    const focusable = getFocusable()
    if (focusable.length > 0) focusable[0].focus()
    else drawer.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const els = getFocusable()
      if (els.length === 0) {
        e.preventDefault()
        return
      }
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused.current?.focus?.()
    }
  }, [openState])

  if (!openState) return null

  return (
    <div
      id="mobile-drawer"
      className="fixed inset-0 z-50 lg:hidden"
      data-testid="mobile-drawer"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Fechar menu"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        data-testid="drawer-backdrop"
      />
      <aside
        ref={drawerRef}
        tabIndex={-1}
        className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col gap-4 bg-surface p-6 shadow-lg transition-transform duration-200 ${className ?? ''}`.trim()}
        data-testid="drawer-panel"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-heading">{title}</h2>
          <button
            type="button"
            aria-label="Fechar menu"
            className="rounded-md p-2 text-text hover:bg-surface-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={onClose}
            data-testid="drawer-close"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2">{children}</div>
      </aside>
    </div>
  )
}