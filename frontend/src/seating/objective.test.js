import { describe, it, expect } from "vitest";
import { scoreAssignment, seatRationale, WEIGHTS } from "./objective";
import { matrixToSeats, findTeacherDesks } from "./seatGrid";

const blankClassroom = {
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

// Reusable 2-row, 3-col matrix:
//   [d, d, d]
//   [d, d, d]
const sixDeskMatrix = [
  ["desk", "desk", "desk"],
  ["desk", "desk", "desk"],
];
const sixDeskSeats = matrixToSeats(sixDeskMatrix);

describe("scoreAssignment", () => {
  it("scores 0 for an empty room", () => {
    const result = scoreAssignment([], {
      classroom: blankClassroom,
      constraints: [],
      seats: [],
      teacherDesks: [],
    });
    expect(result.total).toBe(0);
    expect(result.breakdown.hardViolations).toBe(0);
  });

  it("scores 0 when no rules are active", () => {
    const assignment = [
      makeStudent(1, "A"),
      makeStudent(2, "B"),
      makeStudent(3, "C"),
      makeStudent(4, "D"),
      makeStudent(5, "E"),
      makeStudent(6, "F"),
    ];
    const result = scoreAssignment(assignment, {
      classroom: blankClassroom,
      constraints: [],
      seats: sixDeskSeats,
      teacherDesks: [],
    });
    expect(result.total).toBe(0);
  });

  describe("constraints", () => {
    it("subtracts 100 per separate-pair seated adjacent (horizontally)", () => {
      const assignment = [
        makeStudent(1, "A"),
        makeStudent(2, "B"), // (0,1) — adjacent to A at (0,0)
        makeStudent(3, "C"),
        makeStudent(4, "D"),
        makeStudent(5, "E"),
        makeStudent(6, "F"),
      ];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [{ studentId1: 1, studentId2: 2, constraintType: "separate" }],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.hardViolations).toBe(1);
      expect(result.total).toBe(WEIGHTS.hardViolation);
    });

    it("subtracts 100 per separate-pair seated adjacent (diagonally)", () => {
      const assignment = [
        makeStudent(1, "A"), // (0,0)
        makeStudent(2, "B"),
        makeStudent(3, "C"),
        makeStudent(4, "D"),
        makeStudent(5, "E"), // (1,1) — diagonal to A
        makeStudent(6, "F"),
      ];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [{ studentId1: 1, studentId2: 5, constraintType: "separate" }],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.hardViolations).toBe(1);
    });

    it("does NOT count separate-pair seated 2 cells apart", () => {
      const assignment = [
        makeStudent(1, "A"), // (0,0)
        makeStudent(2, "B"),
        makeStudent(3, "C"), // (0,2) — 2 cells away from A
        makeStudent(4, "D"),
        makeStudent(5, "E"),
        makeStudent(6, "F"),
      ];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [{ studentId1: 1, studentId2: 3, constraintType: "separate" }],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.hardViolations).toBe(0);
    });

    it("adds 10 for a pair seated adjacent", () => {
      const assignment = [
        makeStudent(1, "A"),
        makeStudent(2, "B"),
        makeStudent(3, "C"),
        makeStudent(4, "D"),
        makeStudent(5, "E"),
        makeStudent(6, "F"),
      ];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [{ studentId1: 1, studentId2: 2, constraintType: "pair" }],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.pairSatisfactions).toBe(1);
      expect(result.total).toBe(WEIGHTS.pairSatisfaction);
    });

    it("does not award pair bonus when not adjacent", () => {
      const assignment = [
        makeStudent(1, "A"),
        makeStudent(2, "B"),
        makeStudent(3, "C"), // (0,2) — 2 from A
        makeStudent(4, "D"),
        makeStudent(5, "E"),
        makeStudent(6, "F"),
      ];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [{ studentId1: 1, studentId2: 3, constraintType: "pair" }],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.pairSatisfactions).toBe(0);
    });

    it("ignores constraints involving an unseated student", () => {
      const assignment = [makeStudent(1, "A"), null, null, null, null, null];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [{ studentId1: 1, studentId2: 999, constraintType: "separate" }],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.hardViolations).toBe(0);
    });
  });

  describe("accommodations", () => {
    it("awards +5 to a 504 student in row 0", () => {
      const assignment = [
        makeStudent(1, "A", { has504: true }), // (0,0)
        null,
        null,
        null,
        null,
        null,
      ];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.accommodationBonus).toBe(WEIGHTS.accommodationFront);
    });

    it("awards +5 to an EBD student in row 1 (within 2 rows of front)", () => {
      // sixDeskSeats has rows 0 and 1; front is row 0, so row 1 is within 2.
      const assignment = [
        null,
        null,
        null,
        makeStudent(1, "A", { isEBD: true }), // (1,0)
        null,
        null,
      ];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.accommodationBonus).toBe(WEIGHTS.accommodationFront);
    });

    it("does not award accommodation to a non-flagged student", () => {
      const assignment = [makeStudent(1, "A"), null, null, null, null, null];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.accommodationBonus).toBe(0);
    });

    it("awards +5 to an ESE student in an aisle column", () => {
      // (0,0) and (0,2) are edge columns of the 3-col room.
      const assignment = [
        makeStudent(1, "A", { isESE: true }), // (0,0)
        null,
        null,
        null,
        null,
        null,
      ];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      expect(result.breakdown.accommodationBonus).toBe(WEIGHTS.accommodationAisle);
    });

    it("awards +5 to an ESE student adjacent to a teacher desk", () => {
      const matrix = [
        ["desk", "desk", "teacher-desk"],
        ["desk", "desk", "desk"],
      ];
      const seats = matrixToSeats(matrix);
      const teacherDesks = findTeacherDesks(matrix);
      // seats are: (0,0), (0,1), (1,0), (1,1), (1,2)
      // (0,1) is adjacent to (0,2) teacher desk and is also a non-edge column
      // for its row (cols 0,1 in row 0), so use (1,2) — adjacent to teacher.
      // Actually (1,2) is the last col in row 1, so it's an edge col anyway.
      // Let's place ESE at (0,1): not edge col (cols are 0,1 in row 0), but
      // adjacent to teacher at (0,2).
      const assignment = [null, makeStudent(1, "A", { isESE: true }), null, null, null];
      const result = scoreAssignment(assignment, {
        classroom: blankClassroom,
        constraints: [],
        seats,
        teacherDesks,
      });
      expect(result.breakdown.accommodationBonus).toBe(WEIGHTS.accommodationAisle);
    });
  });

  describe("priority front row bonus", () => {
    it("awards +10 to each priority student in row 0 when flag is on", () => {
      const assignment = [
        makeStudent(1, "A", { has504: true }), // (0,0)
        makeStudent(2, "B", { has504: true }), // (0,1)
        makeStudent(3, "C"), // (0,2)
        makeStudent(4, "D", { has504: true }), // (1,0) — not row 0
        null,
        null,
      ];
      const classroom = { ...blankClassroom, fiveZeroFourIsPriority: true };
      const result = scoreAssignment(assignment, {
        classroom,
        constraints: [],
        seats: sixDeskSeats,
        teacherDesks: [],
      });
      // 2 priority students in row 0 → +20
      expect(result.breakdown.frontRowBonus).toBe(2 * WEIGHTS.frontRowPriority);
    });
  });
});

describe("seatRationale", () => {
  it("returns [] for an empty seat", () => {
    expect(
      seatRationale(0, [null, null], {
        classroom: blankClassroom,
        constraints: [],
        seats: sixDeskSeats,
        teacherDesks: [],
      })
    ).toEqual([]);
  });

  it("notes a satisfied separate-rule", () => {
    const assignment = [
      makeStudent(1, "Alice"),
      null,
      null,
      null,
      null,
      makeStudent(2, "Bob"), // (1,2), distance 2 from Alice
    ];
    const lines = seatRationale(0, assignment, {
      classroom: blankClassroom,
      constraints: [{ studentId1: 1, studentId2: 2, constraintType: "separate" }],
      seats: sixDeskSeats,
      teacherDesks: [],
    });
    expect(lines.some((l) => l.includes("Apart from Bob"))).toBe(true);
  });

  it("notes a violated separate-rule", () => {
    const assignment = [
      makeStudent(1, "Alice"),
      makeStudent(2, "Bob"), // adjacent
      null,
      null,
      null,
      null,
    ];
    const lines = seatRationale(0, assignment, {
      classroom: blankClassroom,
      constraints: [{ studentId1: 1, studentId2: 2, constraintType: "separate" }],
      seats: sixDeskSeats,
      teacherDesks: [],
    });
    expect(lines.some((l) => l.includes("Too close to Bob"))).toBe(true);
  });

  it("notes a satisfied pair rule", () => {
    const assignment = [
      makeStudent(1, "Alice"),
      makeStudent(2, "Bob"),
      null,
      null,
      null,
      null,
    ];
    const lines = seatRationale(0, assignment, {
      classroom: blankClassroom,
      constraints: [{ studentId1: 1, studentId2: 2, constraintType: "pair" }],
      seats: sixDeskSeats,
      teacherDesks: [],
    });
    expect(lines.some((l) => l.includes("Next to Bob"))).toBe(true);
  });

  it("notes 504 front-row accommodation", () => {
    const assignment = [
      makeStudent(1, "Alice", { has504: true }),
      null, null, null, null, null,
    ];
    const lines = seatRationale(0, assignment, {
      classroom: blankClassroom,
      constraints: [],
      seats: sixDeskSeats,
      teacherDesks: [],
    });
    expect(lines.some((l) => l.includes("504"))).toBe(true);
  });
});
