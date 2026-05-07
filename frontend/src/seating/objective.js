/**
 * Scoring function for a seating assignment.
 *
 * The score is a weighted sum across several rules. Higher is better.
 * Hard rules (constraint violations) carry large negative weights;
 * soft rules (preferences, accommodations) carry small positive weights.
 *
 * Pure functions only — no React, no I/O.
 */

import { distance } from "./seatGrid";

// Weights — exposed as constants so tests and the UI can reference them.
export const WEIGHTS = {
  hardViolation: -100, // each "keep apart" pair seated adjacent
  pairSatisfaction: 10, // each "seat together" pair seated adjacent
  accommodationFront: 5, // 504/EBD/ELL within 2 rows of the front
  accommodationAisle: 5, // ESE at a row edge or next to teacher desk
  frontRowPriority: 10, // when a *IsPriority flag is on, in row 0
  balancePenaltyPerUnit: -1, // per-row stddev unit for grade / gender mix
};

/**
 * Build a Map from studentId → seat index.
 */
function indexAssignment(assignment) {
  const map = new Map();
  for (let i = 0; i < assignment.length; i++) {
    const s = assignment[i];
    if (s && s.studentId != null) map.set(s.studentId, i);
  }
  return map;
}

function isFrontSeat(seat, seats) {
  const minRow = seats.reduce((m, s) => Math.min(m, s.row), Infinity);
  return seat.row <= minRow + 1;
}

function isAisleSeat(seat, seats, teacherDesks) {
  // Edge column within the seat's row counts as aisle-adjacent.
  let minCol = Infinity;
  let maxCol = -Infinity;
  for (const s of seats) {
    if (s.row === seat.row) {
      if (s.col < minCol) minCol = s.col;
      if (s.col > maxCol) maxCol = s.col;
    }
  }
  if (seat.col === minCol || seat.col === maxCol) return true;
  // Adjacent to a teacher desk also counts.
  return teacherDesks.some((t) => distance(seat, t) === 1);
}

function stddev(xs) {
  if (xs.length === 0) return 0;
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance =
    xs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / xs.length;
  return Math.sqrt(variance);
}

/**
 * Score an assignment. `assignment[i]` is the student at `seats[i]`, or null.
 */
export function scoreAssignment(assignment, context) {
  const { classroom = {}, constraints = [], seats, teacherDesks = [] } = context;
  const idxByStudent = indexAssignment(assignment);

  let hardViolations = 0;
  let pairSatisfactions = 0;
  const violations = [];

  // Constraint scoring
  for (const c of constraints) {
    const i1 = idxByStudent.get(c.studentId1);
    const i2 = idxByStudent.get(c.studentId2);
    if (i1 == null || i2 == null) continue; // student not seated; skip
    const d = distance(seats[i1], seats[i2]);
    if (c.constraintType === "separate") {
      if (d <= 1) {
        hardViolations += 1;
        violations.push({ type: "separate", constraint: c });
      }
    } else if (c.constraintType === "pair") {
      if (d === 1) {
        pairSatisfactions += 1;
      } else {
        violations.push({ type: "pair-unmet", constraint: c });
      }
    }
  }

  // Accommodation placement
  let accommodationBonus = 0;
  for (let i = 0; i < assignment.length; i++) {
    const student = assignment[i];
    if (!student) continue;
    const seat = seats[i];
    const wantsFront = student.has504 || student.isEBD || student.isELL;
    if (wantsFront && isFrontSeat(seat, seats)) {
      accommodationBonus += WEIGHTS.accommodationFront;
    }
    if (student.isESE && isAisleSeat(seat, seats, teacherDesks)) {
      accommodationBonus += WEIGHTS.accommodationAisle;
    }
  }

  // Front-row priority bonus when classroom has a priority flag set.
  let frontRowBonus = 0;
  const priorityFlag =
    (classroom.eseIsPriority && "isESE") ||
    (classroom.ellIsPriority && "isELL") ||
    (classroom.fiveZeroFourIsPriority && "has504") ||
    (classroom.ebdIsPriority && "isEBD") ||
    null;
  if (priorityFlag) {
    const minRow = seats.reduce((m, s) => Math.min(m, s.row), Infinity);
    for (let i = 0; i < assignment.length; i++) {
      const student = assignment[i];
      if (student && student[priorityFlag] && seats[i].row === minRow) {
        frontRowBonus += WEIGHTS.frontRowPriority;
      }
    }
  }

  // Balance penalty: when seatHighLow / seatMaleFemale, penalize within-row clumping.
  let balancePenalty = 0;
  const rows = new Map();
  for (let i = 0; i < assignment.length; i++) {
    const s = assignment[i];
    if (!s) continue;
    const row = seats[i].row;
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row).push(s);
  }
  if (classroom.seatHighLow) {
    const rowMeans = [];
    for (const studentsInRow of rows.values()) {
      const grades = studentsInRow
        .map((s) => Number(s.grade))
        .filter((g) => !Number.isNaN(g));
      if (grades.length > 0) {
        rowMeans.push(grades.reduce((a, b) => a + b, 0) / grades.length);
      }
    }
    balancePenalty += WEIGHTS.balancePenaltyPerUnit * stddev(rowMeans);
  }
  if (classroom.seatMaleFemale) {
    const ratios = [];
    for (const studentsInRow of rows.values()) {
      if (studentsInRow.length === 0) continue;
      const males = studentsInRow.filter((s) => s.gender === "M").length;
      ratios.push(males / studentsInRow.length);
    }
    balancePenalty += WEIGHTS.balancePenaltyPerUnit * stddev(ratios) * 10;
  }

  const breakdown = {
    hardViolations,
    pairSatisfactions,
    accommodationBonus,
    frontRowBonus,
    balancePenalty,
  };
  const total =
    hardViolations * WEIGHTS.hardViolation +
    pairSatisfactions * WEIGHTS.pairSatisfaction +
    accommodationBonus +
    frontRowBonus +
    balancePenalty;

  return { total, breakdown, violations };
}

/**
 * Build human-readable rationale strings for the student at seat index `i`.
 * Used by the "Why this seat?" UI.
 */
export function seatRationale(seatIndex, assignment, context) {
  const { classroom = {}, constraints = [], seats, teacherDesks = [] } = context;
  const student = assignment[seatIndex];
  if (!student) return [];

  const seat = seats[seatIndex];
  const idxByStudent = indexAssignment(assignment);
  const lines = [];

  // Constraint outcomes involving this student
  for (const c of constraints) {
    if (c.studentId1 !== student.studentId && c.studentId2 !== student.studentId) {
      continue;
    }
    const otherId =
      c.studentId1 === student.studentId ? c.studentId2 : c.studentId1;
    const otherIdx = idxByStudent.get(otherId);
    if (otherIdx == null) continue;
    const other = assignment[otherIdx];
    const d = distance(seat, seats[otherIdx]);
    if (c.constraintType === "separate") {
      if (d <= 1) lines.push(`✗ Too close to ${other.name} (keep-apart rule)`);
      else lines.push(`✓ Apart from ${other.name}`);
    } else if (c.constraintType === "pair") {
      if (d === 1) lines.push(`✓ Next to ${other.name} (seat-together rule)`);
      else lines.push(`✗ Not next to ${other.name} (seat-together rule)`);
    }
  }

  // Accommodations
  const wantsFront = student.has504 || student.isEBD || student.isELL;
  if (wantsFront && isFrontSeat(seat, seats)) {
    const labels = [];
    if (student.has504) labels.push("504");
    if (student.isEBD) labels.push("EBD");
    if (student.isELL) labels.push("ELL");
    lines.push(`✓ Near front (${labels.join(", ")} accommodation)`);
  }
  if (student.isESE && isAisleSeat(seat, seats, teacherDesks)) {
    lines.push("✓ Near aisle (ESE accommodation)");
  }

  // Priority front row
  const priorityFlag =
    (classroom.eseIsPriority && "isESE") ||
    (classroom.ellIsPriority && "isELL") ||
    (classroom.fiveZeroFourIsPriority && "has504") ||
    (classroom.ebdIsPriority && "isEBD") ||
    null;
  if (priorityFlag && student[priorityFlag]) {
    const minRow = seats.reduce((m, s) => Math.min(m, s.row), Infinity);
    if (seat.row === minRow) {
      lines.push("✓ Front row (priority placement)");
    }
  }

  return lines;
}
