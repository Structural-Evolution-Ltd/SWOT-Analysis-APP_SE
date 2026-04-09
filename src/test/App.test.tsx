import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('App', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders the app with default title', () => {
    render(<App />)
    expect(screen.getByText(/My SWOT Analysis/i)).toBeInTheDocument()
  })

  it('renders all four quadrants', () => {
    render(<App />)
    expect(screen.getByTestId('quadrant-strengths')).toBeInTheDocument()
    expect(screen.getByTestId('quadrant-weaknesses')).toBeInTheDocument()
    expect(screen.getByTestId('quadrant-opportunities')).toBeInTheDocument()
    expect(screen.getByTestId('quadrant-threats')).toBeInTheDocument()
  })

  it('shows total item count in subtitle', () => {
    render(<App />)
    expect(screen.getByText(/0 items total/i)).toBeInTheDocument()
  })

  it('can add an item to a quadrant and updates count', () => {
    render(<App />)
    const input = screen.getByLabelText('New Strengths item')
    fireEvent.change(input, { target: { value: 'Brand recognition' } })
    fireEvent.click(screen.getByLabelText('Add Strengths item'))
    expect(screen.getByText('Brand recognition')).toBeInTheDocument()
    expect(screen.getByText(/1 item total/i)).toBeInTheDocument()
  })

  it('can delete an item from a quadrant', () => {
    render(<App />)
    // Add an item first
    const input = screen.getByLabelText('New Strengths item')
    fireEvent.change(input, { target: { value: 'To be deleted' } })
    fireEvent.click(screen.getByLabelText('Add Strengths item'))
    expect(screen.getByText('To be deleted')).toBeInTheDocument()

    // Delete it
    fireEvent.click(screen.getByLabelText('Delete: To be deleted'))
    expect(screen.queryByText('To be deleted')).not.toBeInTheDocument()
  })

  it('can edit analysis title', () => {
    render(<App />)
    const title = screen.getByRole('button', { name: /Analysis title/i })
    fireEvent.click(title)
    const input = screen.getByLabelText('Edit analysis title')
    fireEvent.change(input, { target: { value: 'Q1 Strategy' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Q1 Strategy')).toBeInTheDocument()
  })

  it('persists data to localStorage', () => {
    render(<App />)
    const input = screen.getByLabelText('New Opportunities item')
    fireEvent.change(input, { target: { value: 'New market' } })
    fireEvent.click(screen.getByLabelText('Add Opportunities item'))
    const stored = localStorageMock.getItem('swot-analysis-data')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.opportunities[0].text).toBe('New market')
  })
})
