import { describe, it, expect } from 'vitest'
import { generateSeatingChart, parseGradebookCSV } from './seatingAlgorithm'
import { Student, Desk } from '../types'

// ── Helpers ────────────────────────────────────────────────

function makeStudents(count: number): Student[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `s${i}`,
    name: `Student ${i}`,
    grade: '10',
    scores: {},
    performanceLevel: (['high', 'medium', 'low', 'ungraded'] as const)[i % 4],
  }))
}

function makeSingleDesks(count: number): Desk[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `d${i}`,
    row: Math.floor(i / 5),
    col: i % 5,
    type: 'single' as const,
    rotation: 0,
  }))
}

function makeDoubleDesks(count: number): Desk[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `dd${i}`,
    row: i,
    col: 0,
    type: 'double' as const,
    rotation: 0,
  }))
}

// ── generateSeatingChart ───────────────────────────────────

describe('generateSeatingChart', () => {
  it('assigns all students to seats with random strategy', () => {
    const students = makeStudents(5)
    const desks = makeSingleDesks(5)
    const result = generateSeatingChart(students, desks, { strategy: 'random' })

    expect(result).toHaveLength(5)
    const assignedIds = new Set(result.map(a => a.studentId))
    expect(assignedIds.size).toBe(5)
  })

  it('assigns alphabetically', () => {
    const students: Student[] = [
      { id: 's1', name: 'Zara', grade: '', scores: {}, performanceLevel: 'ungraded' },
      { id: 's2', name: 'Alice', grade: '', scores: {}, performanceLevel: 'ungraded' },
      { id: 's3', name: 'Maya', grade: '', scores: {}, performanceLevel: 'ungraded' },
    ]
    const desks = makeSingleDesks(3)
    const result = generateSeatingChart(students, desks, { strategy: 'alphabetical' })

    expect(result[0].studentId).toBe('s2') // Alice
    expect(result[1].studentId).toBe('s3') // Maya
    expect(result[2].studentId).toBe('s1') // Zara
  })

  it('handles more students than seats by truncating', () => {
    const students = makeStudents(10)
    const desks = makeSingleDesks(3)
    const result = generateSeatingChart(students, desks, { strategy: 'random' })

    expect(result).toHaveLength(3)
  })

  it('handles more seats than students', () => {
    const students = makeStudents(2)
    const desks = makeSingleDesks(5)
    const result = generateSeatingChart(students, desks, { strategy: 'random' })

    expect(result).toHaveLength(2)
  })

  it('assigns two students per double desk', () => {
    const students = makeStudents(4)
    const desks = makeDoubleDesks(2)
    const result = generateSeatingChart(students, desks, { strategy: 'random' })

    expect(result).toHaveLength(4)
    const seat0s = result.filter(a => a.seatIndex === 0)
    const seat1s = result.filter(a => a.seatIndex === 1)
    expect(seat0s).toHaveLength(2)
    expect(seat1s).toHaveLength(2)
  })

  it('mixed strategy interleaves performance levels', () => {
    const students: Student[] = [
      { id: 'h1', name: 'High1', grade: '', scores: {}, performanceLevel: 'high' },
      { id: 'h2', name: 'High2', grade: '', scores: {}, performanceLevel: 'high' },
      { id: 'l1', name: 'Low1', grade: '', scores: {}, performanceLevel: 'low' },
      { id: 'l2', name: 'Low2', grade: '', scores: {}, performanceLevel: 'low' },
    ]
    const desks = makeDoubleDesks(2)
    const result = generateSeatingChart(students, desks, { strategy: 'mixed' })

    expect(result).toHaveLength(4)
    // Each desk should ideally have one high and one low
    const desk0Students = result.filter(a => a.deskId === 'dd0').map(a => students.find(s => s.id === a.studentId)!)
    const levels = desk0Students.map(s => s.performanceLevel)
    expect(levels).toContain('high')
    expect(levels).toContain('low')
  })

  it('grouped strategy clusters same levels', () => {
    const students: Student[] = [
      { id: 'l1', name: 'Low1', grade: '', scores: {}, performanceLevel: 'low' },
      { id: 'h1', name: 'High1', grade: '', scores: {}, performanceLevel: 'high' },
      { id: 'h2', name: 'High2', grade: '', scores: {}, performanceLevel: 'high' },
      { id: 'l2', name: 'Low2', grade: '', scores: {}, performanceLevel: 'low' },
    ]
    const desks = makeSingleDesks(4)
    const result = generateSeatingChart(students, desks, { strategy: 'grouped' })

    // High students should come first (sorted by group)
    const orderedLevels = result.map(a => students.find(s => s.id === a.studentId)!.performanceLevel)
    expect(orderedLevels[0]).toBe('high')
    expect(orderedLevels[1]).toBe('high')
    expect(orderedLevels[2]).toBe('low')
    expect(orderedLevels[3]).toBe('low')
  })

  it('handles empty students', () => {
    const result = generateSeatingChart([], makeSingleDesks(3), { strategy: 'random' })
    expect(result).toHaveLength(0)
  })

  it('handles empty desks', () => {
    const result = generateSeatingChart(makeStudents(3), [], { strategy: 'random' })
    expect(result).toHaveLength(0)
  })
})

// ── parseGradebookCSV ──────────────────────────────────────

describe('parseGradebookCSV', () => {
  it('parses standard gradebook CSV', () => {
    const csv = `Student ID,Name,Grade,Assignment 1,Assignment 2
1,"Smith, John",10,85,90
2,"Doe, Jane",10,70,65`
    const result = parseGradebookCSV(csv)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Smith, John')
    expect(result[0].performanceLevel).toBe('high')  // avg 87.5
    expect(result[1].performanceLevel).toBe('medium') // avg 67.5
  })

  it('parses CSV with quoted fields', () => {
    const csv = `Student ID,Name,Grade,Score
1,"Last, First",10,90`
    const result = parseGradebookCSV(csv)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Last, First')
  })

  it('skips header and empty lines', () => {
    const csv = `Student ID,Name,Grade

1,Test Student,10`
    const result = parseGradebookCSV(csv)
    expect(result).toHaveLength(1)
  })

  it('skips summary rows like Average', () => {
    const csv = `Student ID,Name,Grade,Score
1,Student One,10,75
Average,,10,75`
    const result = parseGradebookCSV(csv)
    expect(result).toHaveLength(1)
  })

  it('assigns low performance for avg < 60', () => {
    const csv = `Student ID,Name,Grade,Score1,Score2
1,Low Student,10,40,50`
    const result = parseGradebookCSV(csv)
    expect(result[0].performanceLevel).toBe('low')
  })

  it('assigns ungraded when no numeric scores exist', () => {
    const csv = `Student ID,Name,Grade
1,No Scores,10`
    const result = parseGradebookCSV(csv)
    expect(result[0].performanceLevel).toBe('ungraded')
  })

  it('returns empty array for invalid CSV', () => {
    const result = parseGradebookCSV('garbage data\nno student IDs')
    expect(result).toHaveLength(0)
  })

  it('truncates long names to 100 characters', () => {
    const longName = 'A'.repeat(200)
    const csv = `Student ID,Name,Grade\n1,${longName},10`
    const result = parseGradebookCSV(csv)
    expect(result[0].name.length).toBe(100)
  })

  it('skips rows with empty names', () => {
    const csv = `Student ID,Name,Grade
1,,10
2,Valid Name,10`
    const result = parseGradebookCSV(csv)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Valid Name')
  })
})
