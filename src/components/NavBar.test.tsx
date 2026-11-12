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
})