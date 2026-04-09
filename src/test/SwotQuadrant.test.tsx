import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SwotQuadrant } from '../components/SwotQuadrant'
import type { SwotItem } from '../types'

describe('SwotQuadrant', () => {
  const mockItems: SwotItem[] = [
    { id: '1', text: 'Strong brand', category: 'strengths' },
    { id: '2', text: 'Great team', category: 'strengths' },
  ]

  const defaultProps = {
    category: 'strengths' as const,
    label: 'Strengths',
    icon: '💪',
    items: [],
    onAddItem: vi.fn(),
    onDeleteItem: vi.fn(),
    onEditItem: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the quadrant header with label and icon', () => {
    render(<SwotQuadrant {...defaultProps} />)
    expect(screen.getByText('Strengths')).toBeInTheDocument()
    expect(screen.getByText('💪')).toBeInTheDocument()
  })

  it('shows empty state message when no items', () => {
    render(<SwotQuadrant {...defaultProps} items={[]} />)
    expect(screen.getByText(/No items yet/i)).toBeInTheDocument()
  })

  it('renders all provided items', () => {
    render(<SwotQuadrant {...defaultProps} items={mockItems} />)
    expect(screen.getByText('Strong brand')).toBeInTheDocument()
    expect(screen.getByText('Great team')).toBeInTheDocument()
  })

  it('shows item count in header', () => {
    render(<SwotQuadrant {...defaultProps} items={mockItems} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls onAddItem when add button is clicked with text', () => {
    render(<SwotQuadrant {...defaultProps} />)
    const input = screen.getByLabelText('New Strengths item')
    fireEvent.change(input, { target: { value: 'New strength' } })
    fireEvent.click(screen.getByLabelText('Add Strengths item'))
    expect(defaultProps.onAddItem).toHaveBeenCalledWith('New strength')
  })

  it('calls onAddItem when Enter is pressed in input', () => {
    render(<SwotQuadrant {...defaultProps} />)
    const input = screen.getByLabelText('New Strengths item')
    fireEvent.change(input, { target: { value: 'Another strength' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(defaultProps.onAddItem).toHaveBeenCalledWith('Another strength')
  })

  it('does not call onAddItem when input is empty', () => {
    render(<SwotQuadrant {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('Add Strengths item'))
    expect(defaultProps.onAddItem).not.toHaveBeenCalled()
  })

  it('calls onDeleteItem when delete button is clicked', () => {
    render(<SwotQuadrant {...defaultProps} items={mockItems} />)
    const deleteButtons = screen.getAllByTitle('Delete item')
    fireEvent.click(deleteButtons[0])
    expect(defaultProps.onDeleteItem).toHaveBeenCalledWith('1')
  })

  it('the add button is disabled when input is empty', () => {
    render(<SwotQuadrant {...defaultProps} />)
    const addBtn = screen.getByLabelText('Add Strengths item')
    expect(addBtn).toBeDisabled()
  })

  it('the add button is enabled when input has text', () => {
    render(<SwotQuadrant {...defaultProps} />)
    const input = screen.getByLabelText('New Strengths item')
    fireEvent.change(input, { target: { value: 'Some text' } })
    const addBtn = screen.getByLabelText('Add Strengths item')
    expect(addBtn).not.toBeDisabled()
  })
})
