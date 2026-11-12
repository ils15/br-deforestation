import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import Filters from './Filters'

afterEach(() => cleanup())

describe('Filters', () => {
  it('renders filter controls', () => {
    render(<Filters />)
    expect(screen.getByTestId('filters')).toBeInTheDocument()
    expect(screen.getByLabelText(/Ano mínimo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ano máximo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Bioma/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Estados/i)).toBeInTheDocument()
  })

  it('calls onChange when year changes', () => {
    const onChange = vi.fn()
    render(<Filters onChange={onChange} />)
    fireEvent.change(screen.getByTestId('year-min'), { target: { value: '2010' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('handles year-max and states changes', () => {
    const onFilter = vi.fn()
    const onFilterChange = vi.fn()
    render(<Filters onFilter={onFilter} onFilterChange={onFilterChange} />)
    fireEvent.change(screen.getByTestId('year-max'), { target: { value: '2020' } })
    expect(onFilter).toHaveBeenCalled()
    const select = screen.getByTestId('states-select') as HTMLSelectElement
    if (select.options.length) select.options[0].selected = true
    fireEvent.change(select)
    expect(onFilterChange).toHaveBeenCalled()
  })

  it('works in controlled mode with context', () => {
    // controlled via value prop
    const onChange = vi.fn()
    const { rerender } = render(<Filters value={{ yearMin: 2008, yearMax: 2024, biome: 'Cerrado', states: ['Pará'] }} onChange={onChange} />)
    expect(screen.getByTestId('year-min')).toHaveValue(2008)
    fireEvent.change(screen.getByTestId('biome-select'), { target: { value: 'Amazônia' } })
    expect(onChange).toHaveBeenCalled()
    rerender(<Filters value={{ yearMin: 2008, yearMax: 2024, biome: 'Cerrado', states: ['Pará'] }} onChange={onChange} />)
  })
})