import { describe, it, expect } from "vitest";
import { solveSeating, mulberry32, swapAssignment } from "./solver";
import { scoreAssignment } from "./objective";
import { matrixToSeats, findTeacherDesks, distance } from "./seatGrid";

const blankClassroom = {
  seatAlphabetical: false,
  seatRandomize: false,
  seatHighLow: false,
  seatMaleFemale: false,
  eseIsPriority: false,
  ellIsPriority: false,
  fiveZeroFourIsPriority: false,
  ebdIsPriority: false,
};

const makeStudent = (id, name, overrides = {}) => ({
  studentId: id,
  name,
  grade: "9",
  gender: "M",
  isESE: false,
  has504: false,
  isELL: false,
  isEBD: false,
  ...overrides,
});

// 2x3 grid of desks — 6 seats, 6 students for full occupancy.
const matrix = [
  ["desk", "desk", "desk"],
  ["desk", "desk", "desk"],
];

const sixStudents = () => [
  makeStudent(1, "A"),
  makeStudent(2, "B"),
  makeStudent(3, "C"),
  makeStudent(4, "D"),
  makeStudent(5, "E"),
  makeStudent(6, "F"),
];

function indexOfStudent(assignment, studentId) {
  return assignment.findIndex((s) => s && s.studentId === studentId);
}

describe("solveSeating", () => {
  it("returns assignment.length === seat count", () => {
    const { assignment } = solveSeating(
      sixStudents(),
      blankClassroom,
      [],
      matrix,
      { iterations: 200, rng: mulberry32(1) }
    );
    expect(assignment).toHaveLength(6);
  });

  it("seats every student when there are exactly enough desks", () => {
    const { assignment } = solveSeating(
      sixStudents(),
      blankClassroom,
      [],
      matrix,
      { iterations: 200, rng: mulberry32(1) }
    );
    const ids = new Set(assignment.map((s) => s && s.studentId));
    expect(ids).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it("is deterministic for a fixed seed", () => {
    const opts = { iterations: 500, rng: mulberry32(42) };
    const r1 = solveSeating(sixStudents(), blankClassroom, [], matrix, opts);
    const r2 = solveSeating(sixStudents(), blankClassroom, [], matrix, {
      ...opts,
      rng: mulberry32(42),
    });
    expect(r1.score).toBe(r2.score);
    expect(r1.assignment.map((s) => s && s.studentId)).toEqual(
      r2.assignment.map((s) => s && s.studentId)
    );
  });

  it("moves a 'separate' pair apart when they start adjacent", () => {
    // Seed with sortAndPrioritizeStudents and no preference flags will keep
    // input order, so students 1 and 2 land at adjacent seats (0,0) and (0,1).
    const constraints = [
      { studentId1: 1, studentId2: 2, constraintType: "separate" },
    ];
    const seats = matrixToSeats(matrix);
    let separated = 0;
    const trials = 5;
    for (let seed = 1; seed <= trials; seed++) {
      const { assignment } = solveSeating(
        sixStudents(),
        blankClassroom,
        constraints,
        matrix,
        { iterations: 1500, rng: mulberry32(seed) }
      );
      const i1 = indexOfStudent(assignment, 1);
      const i2 = indexOfStudent(assignment, 2);
      if (distance(seats[i1], seats[i2]) > 1) separated++;
    }
    // Across 5 seeds the solver should always separate them in this trivial
    // 6-desk room.
    expect(separated).toBe(trials);
  });

  it("seats a 'pair' constraint adjacent when they start far apart", () => {
    // Construct an initial state where students with constraint are NOT
    // adjacent (sort by name puts student id 1 at index 0, student id 6 at
    // index 5 — opposite corners).
    const constraints = [
      { studentId1: 1, studentId2: 6, constraintType: "pair" },
    ];
    const seats = matrixToSeats(matrix);
    let paired = 0;
    const trials = 5;
    for (let seed = 1; seed <= trials; seed++) {
      const { assignment } = solveSeating(
        sixStudents(),
        blankClassroom,
        constraints,
        matrix,
        { iterations: 1500, rng: mulberry32(seed) }
      );
      const i1 = indexOfStudent(assignment, 1);
      const i6 = indexOfStudent(assignment, 6);
      if (distance(seats[i1], seats[i6]) === 1) paired++;
    }
    expect(paired).toBe(trials);
  });

  it("never lowers the score below the seed", () => {
    const constraints = [
      { studentId1: 1, studentId2: 2, constraintType: "separate" },
      { studentId1: 3, studentId2: 4, constraintType: "pair" },
    ];
    const seats = matrixToSeats(matrix);
    const teacherDesks = findTeacherDesks(matrix);
    const seedAssignment = sixStudents();
    const seedScore = scoreAssignment(seedAssignment, {
      classroom: blankClassroom,
      constraints,
      seats,
      teacherDesks,
    }).total;

    const { score } = solveSeating(
      sixStudents(),
      blankClassroom,
      constraints,
      matrix,
      { iterations: 1000, rng: mulberry32(123) }
    );
    expect(score).toBeGreaterThanOrEqual(seedScore);
  });

  it("handles fewer students than desks (leaves nulls in the gaps)", () => {
    const fewStudents = sixStudents().slice(0, 3);
    const { assignment } = solveSeating(
      fewStudents,
      blankClassroom,
      [],
      matrix,
      { iterations: 200, rng: mulberry32(1) }
    );
    expect(assignment).toHaveLength(6);
    expect(assignment.filter((s) => s != null)).toHaveLength(3);
  });

  it("runs 100 iterations over 6 students in well under 100ms", () => {
    const t = performance.now();
    solveSeating(sixStudents(), blankClassroom, [], matrix, {
      iterations: 100,
      rng: mulberry32(1),
    });
    const elapsed = performance.now() - t;
    expect(elapsed).toBeLessThan(100);
  });

  it("stays under 1000ms for a 40-student roster at default iterations", () => {
    // The plan flagged 35+ student classrooms as the perf danger zone.
    // Locking in a generous CI-safe budget so any future regression
    // (e.g. quadratic scoring) trips this. Dev-machine measurement is
    // ~250ms, so 1000ms gives 4x headroom for slower CI hardware.
    const bigMatrix = Array.from({ length: 8 }, () =>
      Array.from({ length: 7 }, () => "desk")
    );
    const bigRoster = Array.from({ length: 40 }, (_, i) =>
      makeStudent(i + 1, `Student ${i + 1}`)
    );
    const constraints = [
      { studentId1: 1, studentId2: 2, constraintType: "separate" },
      { studentId1: 3, studentId2: 4, constraintType: "separate" },
      { studentId1: 5, studentId2: 6, constraintType: "pair" },
    ];

    const t = performance.now();
    solveSeating(bigRoster, blankClassroom, constraints, bigMatrix, {
      rng: mulberry32(1),
    });
    const elapsed = performance.now() - t;
    expect(elapsed).toBeLessThan(1000);
  });

  it("handles a 0-iteration call gracefully", () => {
    const { assignment, score, iterations } = solveSeating(
      sixStudents(),
      blankClassroom,
      [],
      matrix,
      { iterations: 0, rng: mulberry32(1) }
    );
    expect(iterations).toBe(0);
    expect(assignment).toHaveLength(6);
    expect(typeof score).toBe("number");
  });
});

describe("swapAssignment", () => {
  it("swaps two indices and returns a new array", () => {
    const a = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const b = swapAssignment(a, 0, 2);
    expect(b).not.toBe(a);
    expect(b.map((s) => s.id)).toEqual([3, 2, 1]);
    // Original is untouched.
    expect(a.map((s) => s.id)).toEqual([1, 2, 3]);
  });

  it("returns an unchanged copy when i === j", () => {
    const a = [1, 2, 3];
    const b = swapAssignment(a, 1, 1);
    expect(b).toEqual([1, 2, 3]);
    expect(b).not.toBe(a);
  });

  it("handles null entries", () => {
    const a = [null, { id: 1 }, null];
    const b = swapAssignment(a, 0, 1);
    expect(b).toEqual([{ id: 1 }, null, null]);
  });
});

describe("solveSeating with initialAssignment", () => {
  it("uses the supplied assignment as the starting point", () => {
    // Custom seed where students are in REVERSE order. With 0 iterations
    // the solver should return that exact arrangement.
    const reversed = sixStudents().reverse();
    const { assignment } = solveSeating(
      sixStudents(),
      blankClassroom,
      [],
      matrix,
      { iterations: 0, initialAssignment: reversed, rng: mulberry32(1) }
    );
    expect(assignment.map((s) => s.studentId)).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it("pads a shorter initialAssignment with nulls to match seats.length", () => {
    const partial = sixStudents().slice(0, 3); // only 3 students
    const { assignment } = solveSeating(
      sixStudents().slice(0, 3),
      blankClassroom,
      [],
      matrix,
      { iterations: 0, initialAssignment: partial }
    );
    expect(assignment).toHaveLength(6);
    expect(assignment.slice(3)).toEqual([null, null, null]);
  });
});

describe("mulberry32", () => {
  it("produces a deterministic stream for the same seed", () => {
    const r1 = mulberry32(7);
    const r2 = mulberry32(7);
    for (let i = 0; i < 5; i++) {
      expect(r1()).toBe(r2());
    }
  });

  it("produces different streams for different seeds", () => {
    const r1 = mulberry32(1)();
    const r2 = mulberry32(2)();
    expect(r1).not.toBe(r2);
  });
});
