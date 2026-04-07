export interface Student {
  id: string
  name: string
  grade: string
  scores: Record<string, string>
  performanceLevel: 'high' | 'medium' | 'low' | 'ungraded'
}

export interface Desk {
  id: string
  row: number
  col: number
  type: 'single' | 'double'
  rotation: number
}

export type FurnitureType = 'teacher-desk' | 'student-desk' | 'bookshelf' | 'filing-cabinet' | 'rug' | 'whiteboard' | 'door' | 'window' | 'table'

export interface FurnitureItem {
  id: string
  type: FurnitureType
  label: string
  row: number
  col: number
  colSpan: number
  rowSpan: number
  rotated?: boolean
}

export interface ClassroomLayout {
  rows: number
  cols: number
  desks: Desk[]
  furniture: FurnitureItem[]
  name: string
}

export interface SeatAssignment {
  deskId: string
  studentId: string
  seatIndex: number // 0 for single, 0-1 for double
}

export interface SeatingConfig {
  strategy: 'random' | 'mixed' | 'grouped' | 'alphabetical'
}

export type Tab = 'layout' | 'students' | 'chart'
