import { describe, it, expect, beforeEach } from 'vitest'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

beforeEach(() => {
  localStorage.clear()
})

describe('App', () => {
  it('renders welcome screen by default', () => {
    const { container } = render(<App />)
    expect(within(container).getByText('Map My Seat')).toBeInTheDocument()
  })

  it('navigates to layout editor when "Start Fresh" is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    const buttons = within(container).getAllByRole('button')
    const startFreshBtn = buttons.find(btn => btn.textContent?.includes('Start Fresh'))!
    await user.click(startFreshBtn)
    expect(within(container).getByRole('tablist')).toBeInTheDocument()
  })

  it('loads demo mode when "Try the Demo" is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    const buttons = within(container).getAllByRole('button')
    const demoBtn = buttons.find(btn => btn.textContent?.includes('Try the Demo'))!
    await user.click(demoBtn)
    expect(within(container).getByText(/Demo Mode/)).toBeInTheDocument()
  })

  it('navigates between tabs using stepper', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    const buttons = within(container).getAllByRole('button')
    const startFreshBtn = buttons.find(btn => btn.textContent?.includes('Start Fresh'))!
    await user.click(startFreshBtn)

    // Verify Design Layout tab is selected
    const tabs = within(container).getAllByRole('tab')
    const layoutTab = tabs.find(t => t.getAttribute('aria-label')?.includes('Design Layout'))!
    expect(layoutTab).toHaveAttribute('aria-selected', 'true')

    // Click "Add Students" step
    const studentsTab = tabs.find(t => t.getAttribute('aria-label')?.includes('Add Students'))!
    await user.click(studentsTab)
    expect(within(container).getByText('Student Roster')).toBeInTheDocument()
  })

  it('persists state to localStorage', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    const buttons = within(container).getAllByRole('button')
    const startFreshBtn = buttons.find(btn => btn.textContent?.includes('Start Fresh'))!
    await user.click(startFreshBtn)

    const saved = localStorage.getItem('seating-chart-state')
    expect(saved).not.toBeNull()
    const parsed = JSON.parse(saved!)
    expect(parsed.version).toBe(2)
    expect(parsed.layout).toBeDefined()
  })

  it('restores saved state and skips welcome when data exists', () => {
    localStorage.setItem('seating-chart-state', JSON.stringify({
      version: 2,
      layout: { rows: 6, cols: 6, desks: [{ id: 'd1', row: 0, col: 0, type: 'single', rotation: 0 }], furniture: [], name: 'Test' },
      students: [],
    }))

    const { container } = render(<App />)
    // When existing data exists, app skips welcome and goes straight to the editor
    expect(within(container).getByRole('tablist')).toBeInTheDocument()
  })

  it('shows "Continue where you left off" when returning to welcome', async () => {
    localStorage.setItem('seating-chart-state', JSON.stringify({
      version: 2,
      layout: { rows: 6, cols: 6, desks: [{ id: 'd1', row: 0, col: 0, type: 'single', rotation: 0 }], furniture: [], name: 'Test' },
      students: [],
    }))

    const user = userEvent.setup()
    const { container } = render(<App />)
    // Click home button to go back to welcome
    const homeBtn = within(container).getAllByLabelText('Back to home')[0]
    await user.click(homeBtn)
    expect(within(container).getByText(/Continue where you left off/)).toBeInTheDocument()
  })
})
