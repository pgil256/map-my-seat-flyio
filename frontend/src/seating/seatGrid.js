/**
 * Seat grid utilities — pure geometry over the classroom matrix.
 *
 * The classroom is a 2D array where each cell is one of:
 *   "desk"          a student seat
 *   "teacher-desk"  the teacher's seat
 *   anything else   empty space ("empty", numbers from default init, etc.)
 *
 * A `Seat` is { row, col } — coordinates of a "desk" cell in the matrix.
 */

/**
 * Convert a classroom matrix to a flat list of student-desk seats in
 * row-major order (top-to-bottom, left-to-right).
 */
export function matrixToSeats(matrix) {
  const seats = [];
  if (!Array.isArray(matrix)) return seats;
  for (let row = 0; row < matrix.length; row++) {
    const r = matrix[row];
    if (!Array.isArray(r)) continue;
    for (let col = 0; col < r.length; col++) {
      if (r[col] === "desk") {
        seats.push({ row, col });
      }
    }
  }
  return seats;
}

/**
 * Find every teacher-desk cell in the matrix. Used by accommodation rules
 * (e.g. ESE students "near aisle / near teacher").
 */
export function findTeacherDesks(matrix) {
  const desks = [];
  if (!Array.isArray(matrix)) return desks;
  for (let row = 0; row < matrix.length; row++) {
    const r = matrix[row];
    if (!Array.isArray(r)) continue;
    for (let col = 0; col < r.length; col++) {
      if (r[col] === "teacher-desk") {
        desks.push({ row, col });
      }
    }
  }
  return desks;
}

/**
 * Chebyshev distance: max of row and column deltas. Treats diagonal
 * adjacency the same as horizontal/vertical, which matches how desks
 * "neighbor" each other in a classroom grid.
 */
export function distance(a, b) {
  return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
}

/**
 * Seats within Chebyshev distance 1 of `seat` (8-direction adjacency).
 * The seat itself is excluded.
 */
export function neighborsOf(seat, allSeats) {
  return allSeats.filter((s) => {
    if (s.row === seat.row && s.col === seat.col) return false;
    return distance(seat, s) === 1;
  });
}
