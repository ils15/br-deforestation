import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import NavBar from './NavBar'

afterEach(() => cleanup())

describe('NavBar', () => {
  it('renders brand and navigation', () => {
    render(<NavBar />)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('brand')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /principal/i })).toBeInTheDocument()
  })

  it('renders nav links', () => {
    render(<NavBar />)
    expect(screen.getByTestId('nav-links')).toBeInTheDocument()
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
  })

  it('calls onMenuClick from menu button', () => {
    const onMenuClick = vi.fn()
    render(<NavBar onMenuClick={onMenuClick} />)
    fireEvent.click(screen.getByTestId('menu-button'))
    expect(onMenuClick).toHaveBeenCalled()
  })

  it('invokes onNavigate for links', () => {
    const onNavigate = vi.fn()
    render(<NavBar onNavigate={onNavigate} links={[{ label: 'Home' }]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Home' }))
    expect(onNavigate).toHaveBeenCalledWith('Home')
  })

  it('renders search and theme reset action buttons', () => {
    render(<NavBar />)
    expect(screen.getByTestId('search-button')).toBeInTheDocument()
    expect(screen.getByTestId('theme-reset-button')).toBeInTheDocument()
  })

  it('calls onSearch from search button', () => {
    const onSearch = vi.fn()
    render(<NavBar onSearch={onSearch} />)
    fireEvent.click(screen.getByTestId('search-button'))
    expect(onSearch).toHaveBeenCalled()
  })

  it('calls onThemeReset from theme reset button', () => {
    const onThemeReset = vi.fn()
    render(<NavBar onThemeReset={onThemeReset} />)
    fireEvent.click(screen.getByTestId('theme-reset-button'))
    expect(onThemeReset).toHaveBeenCalled()
  })

  it('renders custom brand mark when provided', () => {
    render(<NavBar brandMark="DF" />)
    expect(screen.getByTestId('brand')).toHaveTextContent('DF')
  })

  it('renders custom actions when provided', () => {
    render(<NavBar actions={<button type="button">Custom Action</button>} />)
    expect(screen.getByRole('button', { name: 'Custom Action' })).toBeInTheDocument()
  })

  it('does not render default actions when custom actions provided', () => {
    render(<NavBar actions={<button type="button">Custom Action</button>} />)
    expect(screen.queryByTestId('search-button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('theme-reset-button')).not.toBeInTheDocument()
  })

  it('renders MobileDrawer via menu button', () => {
    const onMenuClick = vi.fn()
    render(<NavBar onMenuClick={onMenuClick} />)
    fireEvent.click(screen.getByTestId('menu-button'))
    expect(onMenuClick).toHaveBeenCalled()
  })
})