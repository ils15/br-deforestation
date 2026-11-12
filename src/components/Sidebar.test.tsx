import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import Sidebar from './Sidebar'

// Test data matching the DEFAULT_SECTIONS structure
const TEST_GROUPS = [
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

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('renders sections with active key', () => {
    render(<Sidebar sections={TEST_GROUPS} activeKey='Amazônia' />)
    expect(screen.getByTestId('sidebar-section-Biomas')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-item-Amazônia')).toBeInTheDocument()
  })

  it('marks the active item with aria-current', () => {
    render(<Sidebar sections={TEST_GROUPS} activeKey='Cerrado' />)
    expect(screen.getByTestId('sidebar-item-Cerrado')).toHaveAttribute('aria-current', 'page')
  })

  it('calls onNavigate when an item is clicked', () => {
    const onNavigate = vi.fn()
    render(<Sidebar sections={TEST_GROUPS} onNavigate={onNavigate} />)
    fireEvent.click(screen.getByTestId('sidebar-item-Cerrado'))
    expect(onNavigate).toHaveBeenCalledWith('Cerrado')
  })

  it('collapses and expands a group', () => {
    render(<Sidebar sections={TEST_GROUPS} />)
    const header = screen.getByTestId('sidebar-section-Biomas')
    expect(header).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-item-Cerrado')).toBeInTheDocument()

    fireEvent.click(header) // collapse
    expect(screen.queryByTestId('sidebar-item-Cerrado')).not.toBeInTheDocument()

    fireEvent.click(header) // expand
    expect(screen.getByTestId('sidebar-item-Cerrado')).toBeInTheDocument()
  })

  it('persists the active key to localStorage', () => {
    render(<Sidebar sections={TEST_GROUPS} onNavigate={vi.fn()} />)
    fireEvent.click(screen.getByTestId('sidebar-item-Comparativo'))
    const stored = localStorage.getItem('br-deforestation:active-sidebar-key')
    expect(stored).toBe('Comparativo')
  })
})
