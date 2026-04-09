import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GradebookManager from './GradebookManager'
import { Student } from '../types'

function makeProps(overrides = {}) {
  return {
    students: [] as Student[],
    onStudentsChange: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
    addToast: vi.fn(),
    ...overrides,
  }
}

describe('GradebookManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders empty state', () => {
    const { container } = render(<GradebookManager {...makeProps()} />)
    expect(within(container).getByText('No students yet')).toBeInTheDocument()
    expect(within(container).getByText('0 Students')).toBeInTheDocument()
  })

  it('adds a student manually', async () => {
    const onStudentsChange = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<GradebookManager {...makeProps({ onStudentsChange })} />)

    const input = within(container).getAllByPlaceholderText(/Type a student name/)[0]
    await user.type(input, 'Smith, John')
    const addBtn = within(container).getAllByText('+ Add')[0]
    await user.click(addBtn)

    expect(onStudentsChange).toHaveBeenCalledTimes(1)
    const newStudents = onStudentsChange.mock.calls[0][0]
    expect(newStudents).toHaveLength(1)
    expect(newStudents[0].name).toBe('Smith, John')
    expect(newStudents[0].performanceLevel).toBe('ungraded')
  })

  it('prevents adding duplicate students', async () => {
    const addToast = vi.fn()
    const user = userEvent.setup()
    const { container } = render(
      <GradebookManager
        {...makeProps({
          students: [{ id: '1', name: 'Smith, John', grade: '', scores: {}, performanceLevel: 'ungraded' }],
          addToast,
        })}
      />,
    )

    const input = within(container).getAllByPlaceholderText(/Type a student name/)[0]
    await user.type(input, 'Smith, John')
    const addBtn = within(container).getAllByText('+ Add')[0]
    await user.click(addBtn)

    expect(addToast).toHaveBeenCalledWith(expect.stringContaining('already in the roster'), 'warning')
  })

  it('displays student list with performance badges', () => {
    const students: Student[] = [
      { id: '1', name: 'Anderson, Emma', grade: '4', scores: {}, performanceLevel: 'high' },
      { id: '2', name: 'Brooks, Liam', grade: '4', scores: {}, performanceLevel: 'low' },
    ]
    const { container } = render(<GradebookManager {...makeProps({ students })} />)

    expect(within(container).getByText('Anderson, Emma')).toBeInTheDocument()
    expect(within(container).getByText('Brooks, Liam')).toBeInTheDocument()
    expect(within(container).getByText('2 Students')).toBeInTheDocument()
  })

  it('removes a student', async () => {
    const onStudentsChange = vi.fn()
    const user = userEvent.setup()
    const students: Student[] = [
      { id: '1', name: 'Anderson, Emma', grade: '4', scores: {}, performanceLevel: 'high' },
    ]
    const { container } = render(<GradebookManager {...makeProps({ students, onStudentsChange })} />)

    const removeBtn = within(container).getAllByLabelText('Remove Anderson, Emma')[0]
    await user.click(removeBtn)
    expect(onStudentsChange).toHaveBeenCalledWith([])
  })

  it('cycles performance level on badge click', async () => {
    const onStudentsChange = vi.fn()
    const user = userEvent.setup()
    const students: Student[] = [
      { id: '1', name: 'Anderson, Emma', grade: '4', scores: {}, performanceLevel: 'high' },
    ]
    const { container } = render(<GradebookManager {...makeProps({ students, onStudentsChange })} />)

    // Find the "High" button with title="Click to cycle performance level"
    const badges = within(container).getAllByTitle('Click to cycle performance level')
    await user.click(badges[0])

    const updated = onStudentsChange.mock.calls[0][0]
    expect(updated[0].performanceLevel).toBe('medium')
  })

  it('shows search when more than 5 students', () => {
    const students: Student[] = Array.from({ length: 6 }, (_, i) => ({
      id: `${i}`,
      name: `Student ${i}`,
      grade: '4',
      scores: {},
      performanceLevel: 'ungraded',
    }))
    const { container } = render(<GradebookManager {...makeProps({ students })} />)
    expect(within(container).getAllByPlaceholderText('Search students...')[0]).toBeInTheDocument()
  })

  it('disables Next button when no students', () => {
    const { container } = render(<GradebookManager {...makeProps()} />)
    const buttons = within(container).getAllByRole('button')
    const nextBtn = buttons.find(btn => btn.textContent?.includes('Generate Chart'))!
    expect(nextBtn).toBeDisabled()
  })

  it('enables Next button when students exist', () => {
    const students: Student[] = [
      { id: '1', name: 'Test', grade: '', scores: {}, performanceLevel: 'ungraded' },
    ]
    const { container } = render(<GradebookManager {...makeProps({ students })} />)
    const buttons = within(container).getAllByRole('button')
    const nextBtn = buttons.find(btn => btn.textContent?.includes('Generate Chart'))!
    expect(nextBtn).not.toBeDisabled()
  })
})
