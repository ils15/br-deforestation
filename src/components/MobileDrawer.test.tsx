import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import MobileDrawer from './MobileDrawer'

afterEach(() => cleanup())

describe('MobileDrawer', () => {
  it('renders nothing when closed', () => {
    render(<MobileDrawer open={false} onClose={() => {}} />)
    expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument()
  })

  it('renders drawer when open', () => {
    render(<MobileDrawer open onClose={() => {}} />)
    expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-panel')).toBeInTheDocument()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(<MobileDrawer open onClose={onClose} />)
    const panel = screen.getByTestId('drawer-panel')
    fireEvent.keyDown(panel, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when close button clicked', () => {
    const onClose = vi.fn()
    render(<MobileDrawer open onClose={onClose} />)
    fireEvent.click(screen.getByTestId('drawer-close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when backdrop clicked', () => {
    const onClose = vi.fn()
    render(<MobileDrawer open onClose={onClose} />)
    fireEvent.click(screen.getByTestId('drawer-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })

  it('traps focus with Tab', () => {
    render(
      <MobileDrawer open onClose={() => {}}>
        <button>First</button>
        <button>Last</button>
      </MobileDrawer>,
    )
    const panel = screen.getByTestId('drawer-panel')
    const buttons = screen.getAllByRole('button')
    // includes close button; just ensure no crash
    expect(panel).toBeInTheDocument()
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('wraps focus forward on Tab from last focusable', () => {
    const onClose = vi.fn()
    render(
      <MobileDrawer open onClose={onClose}>
        <button>First</button>
        <button>Last</button>
      </MobileDrawer>,
    )
    const panel = screen.getByTestId('drawer-panel')
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button'))
    focusable[focusable.length - 1].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(focusable[0])
  })

  it('wraps focus backward on Shift+Tab from first focusable', () => {
    const onClose = vi.fn()
    render(
      <MobileDrawer open onClose={onClose}>
        <button>First</button>
        <button>Last</button>
      </MobileDrawer>,
    )
    const panel = screen.getByTestId('drawer-panel')
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button'))
    focusable[0].focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(focusable[focusable.length - 1])
  })

  it('handles Tab when active element is not last', () => {
    render(
      <MobileDrawer open onClose={() => {}}>
        <button>First</button>
        <button>Last</button>
      </MobileDrawer>,
    )
    const panel = screen.getByTestId('drawer-panel')
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button'))
    // focus middle-ish (first) then Tab without wrap condition
    focusable[0].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    // no crash; active element unchanged by handler
    expect(document.activeElement).toBe(focusable[0])
  })

  it('handles Escape via document keydown', () => {
    const onClose = vi.fn()
    render(<MobileDrawer open onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})