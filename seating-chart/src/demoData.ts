import { ClassroomLayout, Student } from './types'

export const demoLayout: ClassroomLayout = {
  rows: 5,
  cols: 6,
  name: 'Mrs. Johnson\'s 4th Grade',
  furniture: [
    { id: 'demo_f1', type: 'teacher-desk', label: "Teacher's Desk", row: -1, col: 2, colSpan: 2, rowSpan: 1 },
    { id: 'demo_f2', type: 'bookshelf', label: 'Bookshelf', row: -1, col: 0, colSpan: 2, rowSpan: 1 },
    { id: 'demo_f3', type: 'door', label: 'Door', row: 4, col: 5, colSpan: 1, rowSpan: 1 },
    { id: 'demo_f4', type: 'rug', label: 'Reading Rug', row: 3, col: 0, colSpan: 2, rowSpan: 2 },
  ],
  desks: [
    // Row 0: 3 pairs
    { id: 'demo_d1', row: 0, col: 0, type: 'double', rotation: 0 },
    { id: 'demo_d2', row: 0, col: 2, type: 'double', rotation: 0 },
    { id: 'demo_d3', row: 0, col: 4, type: 'double', rotation: 0 },
    // Row 1: 3 pairs
    { id: 'demo_d4', row: 1, col: 0, type: 'double', rotation: 0 },
    { id: 'demo_d5', row: 1, col: 2, type: 'double', rotation: 0 },
    { id: 'demo_d6', row: 1, col: 4, type: 'double', rotation: 0 },
    // Row 2: 3 pairs
    { id: 'demo_d7', row: 2, col: 0, type: 'double', rotation: 0 },
    { id: 'demo_d8', row: 2, col: 2, type: 'double', rotation: 0 },
    { id: 'demo_d9', row: 2, col: 4, type: 'double', rotation: 0 },
    // Row 3-4: singles on right side (rug takes up left)
    { id: 'demo_d10', row: 3, col: 2, type: 'single', rotation: 0 },
    { id: 'demo_d11', row: 3, col: 3, type: 'single', rotation: 0 },
    { id: 'demo_d12', row: 3, col: 4, type: 'single', rotation: 0 },
    { id: 'demo_d13', row: 4, col: 2, type: 'single', rotation: 0 },
    { id: 'demo_d14', row: 4, col: 3, type: 'single', rotation: 0 },
  ],
}

export const demoStudents: Student[] = [
  { id: 'ds1',  name: 'Anderson, Emma',        grade: '4', scores: {}, performanceLevel: 'high' },
  { id: 'ds2',  name: 'Brooks, Liam',          grade: '4', scores: {}, performanceLevel: 'high' },
  { id: 'ds3',  name: 'Chen, Sophia',          grade: '4', scores: {}, performanceLevel: 'high' },
  { id: 'ds4',  name: 'Davis, Noah',           grade: '4', scores: {}, performanceLevel: 'high' },
  { id: 'ds5',  name: 'Foster, Olivia',        grade: '4', scores: {}, performanceLevel: 'medium' },
  { id: 'ds6',  name: 'Garcia, Ethan',         grade: '4', scores: {}, performanceLevel: 'medium' },
  { id: 'ds7',  name: 'Hernandez, Isabella',   grade: '4', scores: {}, performanceLevel: 'medium' },
  { id: 'ds8',  name: 'Jackson, Mason',        grade: '4', scores: {}, performanceLevel: 'medium' },
  { id: 'ds9',  name: 'Kim, Ava',              grade: '4', scores: {}, performanceLevel: 'medium' },
  { id: 'ds10', name: 'Lewis, Lucas',          grade: '4', scores: {}, performanceLevel: 'medium' },
  { id: 'ds11', name: 'Martinez, Mia',         grade: '4', scores: {}, performanceLevel: 'medium' },
  { id: 'ds12', name: 'Nguyen, Aiden',         grade: '4', scores: {}, performanceLevel: 'low' },
  { id: 'ds13', name: 'O\'Brien, Charlotte',   grade: '4', scores: {}, performanceLevel: 'low' },
  { id: 'ds14', name: 'Patel, Elijah',         grade: '4', scores: {}, performanceLevel: 'low' },
  { id: 'ds15', name: 'Robinson, Amelia',      grade: '4', scores: {}, performanceLevel: 'low' },
  { id: 'ds16', name: 'Smith, James',          grade: '4', scores: {}, performanceLevel: 'high' },
  { id: 'ds17', name: 'Thompson, Harper',      grade: '4', scores: {}, performanceLevel: 'medium' },
  { id: 'ds18', name: 'Williams, Benjamin',    grade: '4', scores: {}, performanceLevel: 'ungraded' },
  { id: 'ds19', name: 'Young, Ella',           grade: '4', scores: {}, performanceLevel: 'ungraded' },
  { id: 'ds20', name: 'Zhang, Oliver',         grade: '4', scores: {}, performanceLevel: 'high' },
  { id: 'ds21', name: 'Baker, Scarlett',       grade: '4', scores: {}, performanceLevel: 'medium' },
  { id: 'ds22', name: 'Clark, Henry',          grade: '4', scores: {}, performanceLevel: 'low' },
  { id: 'ds23', name: 'Edwards, Luna',         grade: '4', scores: {}, performanceLevel: 'high' },
  { id: 'ds24', name: 'Flores, Jack',          grade: '4', scores: {}, performanceLevel: 'medium' },
]
