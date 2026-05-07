/**
 * Simulated-annealing seating solver.
 *
 * Starts from the legacy `sortAndPrioritizeStudents` arrangement (so behavior
 * is identical when no constraints / accommodations apply), then performs a
 * sequence of random 2-seat swaps. Each swap is accepted if it improves the
 * objective score, or with probability exp(Δ/T) if not — with T cooling
 * geometrically from a high starting temperature toward zero.
 *
 * Pure function. The RNG is injectable so tests can be deterministic.
 */

import { sortAndPrioritizeStudents } from "./algorithms";
import { matrixToSeats, findTeacherDesks } from "./seatGrid";
import { scoreAssignment } from "./objective";

const DEFAULT_OPTS = {
  iterations: 2000,
  T0: 10,
  Tmin: 0.01,
  rng: Math.random,
};

/**
 * Mulberry32 — small deterministic PRNG used for seeding tests.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build the initial assignment from the legacy sort, padding with nulls so
 * length === seats.length. Surplus students (more students than desks) are
 * dropped — current product behavior.
 */
function seedAssignment(students, classroom, seatCount) {
  const sorted = sortAndPrioritizeStudents(students, classroom);
  const assignment = new Array(seatCount).fill(null);
  for (let i = 0; i < Math.min(sorted.length, seatCount); i++) {
    assignment[i] = sorted[i];
  }
  return assignment;
}

/**
 * Swap two seats in an assignment. Pure — returns a new array.
 */
export function swapAssignment(assignment, i, j) {
  if (i === j) return assignment.slice();
  const next = assignment.slice();
  const tmp = next[i];
  next[i] = next[j];
  next[j] = tmp;
  return next;
}

/**
 * Solve a seating assignment using simulated annealing.
 *
 * @returns { assignment, score, breakdown, iterations }
 *  - assignment: Array<Student | null>, parallel to seats
 *  - score: number (higher is better)
 *  - breakdown: per-rule score components
 *  - iterations: how many swaps were attempted
 */
export function solveSeating(students, classroom, constraints, matrix, opts = {}) {
  const { iterations, T0, Tmin, rng, initialAssignment } = { ...DEFAULT_OPTS, ...opts };

  const seats = matrixToSeats(matrix);
  const teacherDesks = findTeacherDesks(matrix);
  const context = { classroom, constraints: constraints || [], seats, teacherDesks };

  // If the caller supplies a starting arrangement (e.g. "Re-optimize from
  // current chart"), use it; otherwise fall back to the legacy sort seed.
  let assignment = Array.isArray(initialAssignment)
    ? initialAssignment.slice(0, seats.length)
    : seedAssignment(students, classroom, seats.length);
  // Pad if the supplied assignment is shorter than the room.
  while (assignment.length < seats.length) assignment.push(null);

  // No swaps possible if 0 or 1 desks; just return the seed.
  if (seats.length < 2) {
    const { total, breakdown } = scoreAssignment(assignment, context);
    return { assignment, score: total, breakdown, iterations: 0 };
  }

  let currentScore = scoreAssignment(assignment, context).total;
  let bestAssignment = assignment.slice();
  let bestScore = currentScore;

  const cooling = Math.pow(Tmin / T0, 1 / Math.max(iterations, 1));
  let T = T0;

  for (let i = 0; i < iterations; i++) {
    const a = Math.floor(rng() * seats.length);
    let b = Math.floor(rng() * seats.length);
    if (a === b) {
      T *= cooling;
      continue;
    }
    // Skip null↔null swap — no effect.
    if (assignment[a] == null && assignment[b] == null) {
      T *= cooling;
      continue;
    }

    // Try the swap.
    const tmp = assignment[a];
    assignment[a] = assignment[b];
    assignment[b] = tmp;
    const newScore = scoreAssignment(assignment, context).total;
    const delta = newScore - currentScore;

    const accept = delta > 0 || rng() < Math.exp(delta / T);
    if (accept) {
      currentScore = newScore;
      if (newScore > bestScore) {
        bestScore = newScore;
        bestAssignment = assignment.slice();
      }
    } else {
      // Revert.
      assignment[b] = assignment[a];
      assignment[a] = tmp;
    }
    T *= cooling;
  }

  const { breakdown } = scoreAssignment(bestAssignment, context);
  return { assignment: bestAssignment, score: bestScore, breakdown, iterations };
}
