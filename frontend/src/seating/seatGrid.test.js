import { describe, it, expect } from "vitest";
import {
  matrixToSeats,
  distance,
  neighborsOf,
  findTeacherDesks,
} from "./seatGrid";

describe("matrixToSeats", () => {
  it("returns [] for an empty matrix", () => {
    expect(matrixToSeats([])).toEqual([]);
  });

  it("returns [] for a matrix with no desks", () => {
    const m = [
      ["empty", "empty"],
      ["teacher-desk", 0],
    ];
    expect(matrixToSeats(m)).toEqual([]);
  });

  it("ignores non-array rows", () => {
    const m = [["desk"], null, undefined, ["desk"]];
    expect(matrixToSeats(m)).toEqual([
      { row: 0, col: 0 },
      { row: 3, col: 0 },
    ]);
  });

  it("ignores non-string and non-desk cells", () => {
    const m = [["desk", "teacher-desk", "empty", 0, null]];
    expect(matrixToSeats(m)).toEqual([{ row: 0, col: 0 }]);
  });

  it("walks rows top-to-bottom, columns left-to-right", () => {
    const m = [
      ["desk", "empty", "desk"],
      ["empty", "desk", "empty"],
    ];
    expect(matrixToSeats(m)).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 2 },
      { row: 1, col: 1 },
    ]);
  });

  it("handles non-rectangular matrices", () => {
    const m = [["desk"], ["desk", "desk", "desk"]];
    expect(matrixToSeats(m)).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ]);
  });

  it("handles a non-array input", () => {
    expect(matrixToSeats(null)).toEqual([]);
    expect(matrixToSeats(undefined)).toEqual([]);
    expect(matrixToSeats("not a matrix")).toEqual([]);
  });
});

describe("distance", () => {
  it("returns 0 for the same seat", () => {
    expect(distance({ row: 2, col: 3 }, { row: 2, col: 3 })).toBe(0);
  });

  it("returns 1 for horizontal neighbors", () => {
    expect(distance({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(1);
  });

  it("returns 1 for vertical neighbors", () => {
    expect(distance({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(1);
  });

  it("returns 1 for diagonal neighbors", () => {
    expect(distance({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(1);
  });

  it("returns the max axis delta (Chebyshev)", () => {
    expect(distance({ row: 0, col: 0 }, { row: 3, col: 5 })).toBe(5);
    expect(distance({ row: 0, col: 0 }, { row: 5, col: 3 })).toBe(5);
  });

  it("is symmetric", () => {
    const a = { row: 1, col: 2 };
    const b = { row: 4, col: 7 };
    expect(distance(a, b)).toBe(distance(b, a));
  });
});

describe("neighborsOf", () => {
  // 3x3 grid of all desks
  const allDesks3x3 = matrixToSeats([
    ["desk", "desk", "desk"],
    ["desk", "desk", "desk"],
    ["desk", "desk", "desk"],
  ]);

  it("returns 8 neighbors for a center seat", () => {
    const center = { row: 1, col: 1 };
    expect(neighborsOf(center, allDesks3x3)).toHaveLength(8);
  });

  it("returns 3 neighbors for a corner seat", () => {
    const corner = { row: 0, col: 0 };
    const ns = neighborsOf(corner, allDesks3x3);
    expect(ns).toHaveLength(3);
    expect(ns).toEqual(
      expect.arrayContaining([
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ])
    );
  });

  it("returns 5 neighbors for an edge seat", () => {
    const edge = { row: 0, col: 1 };
    expect(neighborsOf(edge, allDesks3x3)).toHaveLength(5);
  });

  it("excludes the seat itself", () => {
    const seat = { row: 1, col: 1 };
    const ns = neighborsOf(seat, allDesks3x3);
    expect(ns).not.toContainEqual(seat);
  });

  it("returns [] when the seat is isolated", () => {
    const isolated = { row: 0, col: 0 };
    const farSeats = [
      { row: 5, col: 5 },
      { row: 8, col: 8 },
    ];
    expect(neighborsOf(isolated, farSeats)).toEqual([]);
  });

  it("skips empty cells in the matrix", () => {
    // teacher-desk at (1,1) means it's not a student seat,
    // so the center seat has only 7 student neighbors.
    const seats = matrixToSeats([
      ["desk", "desk", "desk"],
      ["desk", "teacher-desk", "desk"],
      ["desk", "desk", "desk"],
    ]);
    // Pick the seat at (0,0) — it should see 2 neighbors (not 3),
    // because (1,1) is a teacher-desk, not a student desk.
    const corner = seats.find((s) => s.row === 0 && s.col === 0);
    expect(neighborsOf(corner, seats)).toHaveLength(2);
  });

  it("works with non-adjacent seats by row-major comparison", () => {
    const a = { row: 0, col: 0 };
    const b = { row: 0, col: 2 }; // distance 2, not a neighbor
    expect(neighborsOf(a, [a, b])).toEqual([]);
  });
});

describe("findTeacherDesks", () => {
  it("returns [] for an empty matrix", () => {
    expect(findTeacherDesks([])).toEqual([]);
  });

  it("returns [] when there are no teacher desks", () => {
    expect(findTeacherDesks([["desk", "empty"]])).toEqual([]);
  });

  it("finds a single teacher desk", () => {
    const m = [
      ["desk", "desk"],
      ["desk", "teacher-desk"],
    ];
    expect(findTeacherDesks(m)).toEqual([{ row: 1, col: 1 }]);
  });

  it("finds multiple teacher desks in row-major order", () => {
    const m = [
      ["teacher-desk", "desk", "teacher-desk"],
      ["desk", "desk", "desk"],
    ];
    expect(findTeacherDesks(m)).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 2 },
    ]);
  });

  it("ignores non-array inputs", () => {
    expect(findTeacherDesks(null)).toEqual([]);
    expect(findTeacherDesks(undefined)).toEqual([]);
  });
});
