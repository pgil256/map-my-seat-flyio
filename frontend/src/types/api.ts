// Shared TypeScript types for API responses and data models

// User types
export interface User {
  username: string;
  email: string;
  title: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface UserSignupData {
  username: string;
  password: string;
  email: string;
  title: string;
  firstName: string;
  lastName: string;
}

export interface UserLoginData {
  username: string;
  password: string;
}

// Period types
export interface Period {
  periodId: number;
  username: string;
  schoolYear: string;
  title: string;
  number: number;
}

export interface PeriodCreateData {
  schoolYear: string;
  title: string;
  number: number;
}

// Student types
export interface Student {
  studentId: number;
  periodId: number;
  name: string;
  grade: number | null;
  gender: string | null;
  isESE: boolean;
  has504: boolean;
  isELL: boolean;
  isEBD: boolean;
}

export interface StudentCreateData {
  name: string;
  grade?: number;
  gender?: string;
  isESE?: boolean;
  has504?: boolean;
  isELL?: boolean;
  isEBD?: boolean;
}

// Classroom types
export type CellType = "desk" | "teacher-desk" | null;
export type SeatingConfig = CellType[][];

export interface Classroom {
  classroomId: number;
  username: string;
  seatAlphabetical: boolean;
  seatRandomize: boolean;
  seatHighLow: boolean;
  seatMaleFemale: boolean;
  eseIsPriority: boolean;
  ellIsPriority: boolean;
  fiveZeroFourIsPriority: boolean;
  ebdIsPriority: boolean;
  seatingConfig: SeatingConfig;
}

export interface ClassroomUpdateData {
  seatAlphabetical?: boolean;
  seatRandomize?: boolean;
  seatHighLow?: boolean;
  seatMaleFemale?: boolean;
  eseIsPriority?: boolean;
  ellIsPriority?: boolean;
  fiveZeroFourIsPriority?: boolean;
  ebdIsPriority?: boolean;
  seatingConfig?: string;
}

// Seating Chart types
export interface SeatingChart {
  seatingChartId: number;
  classroomId: number;
  number: number;
  arrangement: Student[];
}

// API Error types
export interface ApiErrorResponse {
  error: string;
  code: string;
  status: number;
  details?: unknown;
}

// Auth response types
export interface AuthResponse {
  token: string;
}

export interface ApiSuccessResult {
  success: true;
}

export interface ApiFailureResult {
  success: false;
  errors: string[];
}

export type AuthResult = ApiSuccessResult | ApiFailureResult;
