import { Student, Desk, SeatAssignment, SeatingConfig } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getTotalSeats(desks: Desk[]): number {
  return desks.reduce((sum, d) => sum + (d.type === 'double' ? 2 : 1), 0)
}

function generateRandom(students: Student[], desks: Desk[]): SeatAssignment[] {
  const shuffled = shuffle(students)
  return assignInOrder(shuffled, desks)
}

function generateAlphabetical(students: Student[], desks: Desk[]): SeatAssignment[] {
  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name))
  return assignInOrder(sorted, desks)
}

function generateMixed(students: Student[], desks: Desk[]): SeatAssignment[] {
  const high = shuffle(students.filter(s => s.performanceLevel === 'high'))
  const medium = shuffle(students.filter(s => s.performanceLevel === 'medium'))
  const low = shuffle(students.filter(s => s.performanceLevel === 'low'))
  const ungraded = shuffle(students.filter(s => s.performanceLevel === 'ungraded'))

  // Interleave: try to pair high with low at double desks
  const ordered: Student[] = []
  const maxLen = Math.max(high.length, medium.length, low.length, ungraded.length)
  for (let i = 0; i < maxLen; i++) {
    if (i < high.length) ordered.push(high[i])
    if (i < low.length) ordered.push(low[i])
    if (i < medium.length) ordered.push(medium[i])
    if (i < ungraded.length) ordered.push(ungraded[i])
  }
  return assignInOrder(ordered, desks)
}

function generateGrouped(students: Student[], desks: Desk[]): SeatAssignment[] {
  const high = shuffle(students.filter(s => s.performanceLevel === 'high'))
  const medium = shuffle(students.filter(s => s.performanceLevel === 'medium'))
  const low = shuffle(students.filter(s => s.performanceLevel === 'low'))
  const ungraded = shuffle(students.filter(s => s.performanceLevel === 'ungraded'))
  const ordered = [...high, ...medium, ...low, ...ungraded]
  return assignInOrder(ordered, desks)
}

function assignInOrder(students: Student[], desks: Desk[]): SeatAssignment[] {
  const sortedDesks = [...desks].sort((a, b) => a.row - b.row || a.col - b.col)
  const assignments: SeatAssignment[] = []
  let studentIdx = 0

  for (const desk of sortedDesks) {
    const seats = desk.type === 'double' ? 2 : 1
    for (let seatIndex = 0; seatIndex < seats; seatIndex++) {
      if (studentIdx < students.length) {
        assignments.push({
          deskId: desk.id,
          studentId: students[studentIdx].id,
          seatIndex,
        })
        studentIdx++
      }
    }
  }

  return assignments
}

export function generateSeatingChart(
  students: Student[],
  desks: Desk[],
  config: SeatingConfig,
): SeatAssignment[] {
  const totalSeats = getTotalSeats(desks)
  const studentsToSeat = students.slice(0, totalSeats)

  switch (config.strategy) {
    case 'random':
      return generateRandom(studentsToSeat, desks)
    case 'alphabetical':
      return generateAlphabetical(studentsToSeat, desks)
    case 'mixed':
      return generateMixed(studentsToSeat, desks)
    case 'grouped':
      return generateGrouped(studentsToSeat, desks)
    default:
      return generateRandom(studentsToSeat, desks)
  }
}

export function parseGradebookCSV(csvText: string): Student[] {
  const lines = csvText.split('\n')
  const students: Student[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Parse CSV respecting quotes
    const fields = parseCSVLine(trimmed)

    // Skip header rows and summary rows
    if (!fields[0] || fields[0] === 'Average' || fields[0] === 'Student ID') continue
    if (!/^\d+$/.test(fields[0].trim())) continue

    const studentId = fields[0].trim()
    const name = fields[1]?.trim() || ''
    const grade = fields[2]?.trim() || ''

    if (!name) continue

    const scores: Record<string, string> = {}
    for (let i = 3; i < fields.length; i++) {
      scores[`assignment_${i - 3}`] = fields[i]?.trim() || ''
    }

    const numericScores = Object.values(scores)
      .map(s => parseFloat(s))
      .filter(n => !isNaN(n))

    let performanceLevel: Student['performanceLevel'] = 'ungraded'
    if (numericScores.length > 0) {
      const avg = numericScores.reduce((a, b) => a + b, 0) / numericScores.length
      if (avg >= 80) performanceLevel = 'high'
      else if (avg >= 60) performanceLevel = 'medium'
      else performanceLevel = 'low'
    }

    students.push({ id: studentId, name, grade, scores, performanceLevel })
  }

  return students
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  fields.push(current)
  return fields
}
