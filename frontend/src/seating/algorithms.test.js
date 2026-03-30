import { describe, it, expect } from "vitest";
import { sortAndPrioritizeStudents, spreadStudents } from "./algorithms";

const makeStudent = (overrides = {}) => ({
  name: "Student",
  grade: 10,
  gender: "M",
  isESE: false,
  has504: false,
  isELL: false,
  isEBD: false,
  ...overrides,
});

const noPrefsClassroom = {
  seatAlphabetical: false,
  seatRandomize: false,
  seatHighLow: false,
  seatMaleFemale: false,
  eseIsPriority: false,
  ellIsPriority: false,
  fiveZeroFourIsPriority: false,
  ebdIsPriority: false,
};

describe("sortAndPrioritizeStudents", () => {
  describe("Alphabetical", () => {
    const classroom = { ...noPrefsClassroom, seatAlphabetical: true };

    it("sorts A-Z by name", () => {
      const students = [
        makeStudent({ name: "Charlie" }),
        makeStudent({ name: "Alice" }),
        makeStudent({ name: "Bob" }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.name)).toEqual(["Alice", "Bob", "Charlie"]);
    });

    it("handles a single student", () => {
      const students = [makeStudent({ name: "Alice" })];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.name)).toEqual(["Alice"]);
    });

    it("handles an empty array", () => {
      const result = sortAndPrioritizeStudents([], classroom);
      expect(result).toEqual([]);
    });

    it("handles students with the same name", () => {
      const students = [
        makeStudent({ name: "Alice", grade: 10 }),
        makeStudent({ name: "Alice", grade: 9 }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Alice");
      expect(result[1].name).toBe("Alice");
    });
  });

  describe("Randomize", () => {
    const classroom = { ...noPrefsClassroom, seatRandomize: true };

    it("returns the same students (same length and membership)", () => {
      const students = [
        makeStudent({ name: "Alice" }),
        makeStudent({ name: "Bob" }),
        makeStudent({ name: "Charlie" }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(students));
    });

    it("handles a single student", () => {
      const students = [makeStudent({ name: "Alice" })];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Alice");
    });

    it("handles an empty array", () => {
      const result = sortAndPrioritizeStudents([], classroom);
      expect(result).toEqual([]);
    });

    it("does not mutate the original array", () => {
      const students = [
        makeStudent({ name: "Alice" }),
        makeStudent({ name: "Bob" }),
        makeStudent({ name: "Charlie" }),
      ];
      const original = [...students];
      sortAndPrioritizeStudents(students, classroom);
      expect(students).toEqual(original);
    });
  });

  describe("High-Low", () => {
    const classroom = { ...noPrefsClassroom, seatHighLow: true };

    it("interleaves lowest and highest grades", () => {
      const students = [
        makeStudent({ name: "A", grade: 10 }),
        makeStudent({ name: "B", grade: 7 }),
        makeStudent({ name: "C", grade: 5 }),
        makeStudent({ name: "D", grade: 3 }),
      ];
      // sorted descending: [10,7,5,3]
      // shift(10),pop(3),shift(7),pop(5) => [10,3,7,5]
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.grade)).toEqual([10, 3, 7, 5]);
    });

    it("handles an odd number of students", () => {
      const students = [
        makeStudent({ name: "A", grade: 5 }),
        makeStudent({ name: "B", grade: 3 }),
        makeStudent({ name: "C", grade: 1 }),
      ];
      // sorted descending: [5,3,1]
      // shift(5),pop(1),shift(3) => [5,1,3]
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.grade)).toEqual([5, 1, 3]);
    });

    it("handles all same grade", () => {
      const students = [
        makeStudent({ name: "A", grade: 5 }),
        makeStudent({ name: "B", grade: 5 }),
        makeStudent({ name: "C", grade: 5 }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(3);
      expect(result.every((s) => s.grade === 5)).toBe(true);
    });

    it("handles a single student", () => {
      const students = [makeStudent({ name: "A", grade: 10 })];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(1);
      expect(result[0].grade).toBe(10);
    });

    it("handles an empty array", () => {
      const result = sortAndPrioritizeStudents([], classroom);
      expect(result).toEqual([]);
    });

    it("handles two students", () => {
      const students = [
        makeStudent({ name: "A", grade: 10 }),
        makeStudent({ name: "B", grade: 3 }),
      ];
      // sorted descending: [10,3]
      // shift(10),pop(3) => [10,3]
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.grade)).toEqual([10, 3]);
    });
  });

  describe("Male-Female", () => {
    const classroom = { ...noPrefsClassroom, seatMaleFemale: true };

    it("interleaves genders", () => {
      const students = [
        makeStudent({ name: "A", gender: "F" }),
        makeStudent({ name: "B", gender: "F" }),
        makeStudent({ name: "C", gender: "M" }),
        makeStudent({ name: "D", gender: "M" }),
      ];
      // sorted by gender alpha: [F,F,M,M]
      // shift(F),pop(M),shift(F),pop(M) => [F,M,F,M]
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.gender)).toEqual(["F", "M", "F", "M"]);
    });

    it("handles all same gender", () => {
      const students = [
        makeStudent({ name: "A", gender: "M" }),
        makeStudent({ name: "B", gender: "M" }),
        makeStudent({ name: "C", gender: "M" }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(3);
      expect(result.every((s) => s.gender === "M")).toBe(true);
    });

    it("handles uneven gender ratio (3F, 1M)", () => {
      const students = [
        makeStudent({ name: "A", gender: "F" }),
        makeStudent({ name: "B", gender: "F" }),
        makeStudent({ name: "C", gender: "F" }),
        makeStudent({ name: "D", gender: "M" }),
      ];
      // sorted by gender alpha: [F,F,F,M]
      // shift(F),pop(M),shift(F),pop(F) => [F,M,F,F]
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.gender)).toEqual(["F", "M", "F", "F"]);
    });

    it("handles odd number", () => {
      const students = [
        makeStudent({ name: "A", gender: "F" }),
        makeStudent({ name: "B", gender: "M" }),
        makeStudent({ name: "C", gender: "M" }),
      ];
      // sorted by gender alpha: [F,M,M]
      // shift(F),pop(M),shift(M) => [F,M,M]
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.gender)).toEqual(["F", "M", "M"]);
    });

    it("handles an empty array", () => {
      const result = sortAndPrioritizeStudents([], classroom);
      expect(result).toEqual([]);
    });
  });

  describe("Priority front-loading", () => {
    it("ESE priority moves ESE students to front", () => {
      const classroom = { ...noPrefsClassroom, eseIsPriority: true };
      const students = [
        makeStudent({ name: "A", isESE: false }),
        makeStudent({ name: "B", isESE: true }),
        makeStudent({ name: "C", isESE: false }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result[0].name).toBe("B");
      expect(result).toHaveLength(3);
    });

    it("ELL priority with multiple ELL students", () => {
      const classroom = { ...noPrefsClassroom, ellIsPriority: true };
      const students = [
        makeStudent({ name: "A", isELL: false }),
        makeStudent({ name: "B", isELL: true }),
        makeStudent({ name: "C", isELL: true }),
        makeStudent({ name: "D", isELL: false }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result[0].name).toBe("B");
      expect(result[1].name).toBe("C");
      expect(result).toHaveLength(4);
    });

    it("504 priority", () => {
      const classroom = {
        ...noPrefsClassroom,
        fiveZeroFourIsPriority: true,
      };
      const students = [
        makeStudent({ name: "A", has504: false }),
        makeStudent({ name: "B", has504: true }),
        makeStudent({ name: "C", has504: false }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result[0].name).toBe("B");
    });

    it("EBD priority", () => {
      const classroom = { ...noPrefsClassroom, ebdIsPriority: true };
      const students = [
        makeStudent({ name: "A", isEBD: false }),
        makeStudent({ name: "B", isEBD: true }),
        makeStudent({ name: "C", isEBD: false }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result[0].name).toBe("B");
    });

    it("no priority — order unchanged after sort", () => {
      const students = [
        makeStudent({ name: "A" }),
        makeStudent({ name: "B" }),
        makeStudent({ name: "C" }),
      ];
      const result = sortAndPrioritizeStudents(students, noPrefsClassroom);
      expect(result.map((s) => s.name)).toEqual(["A", "B", "C"]);
    });

    it("all students have priority flag — order unchanged", () => {
      const classroom = { ...noPrefsClassroom, eseIsPriority: true };
      const students = [
        makeStudent({ name: "A", isESE: true }),
        makeStudent({ name: "B", isESE: true }),
        makeStudent({ name: "C", isESE: true }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.name)).toEqual(["A", "B", "C"]);
    });
  });

  describe("No preferences", () => {
    it("returns students in original order", () => {
      const students = [
        makeStudent({ name: "C" }),
        makeStudent({ name: "A" }),
        makeStudent({ name: "B" }),
      ];
      const result = sortAndPrioritizeStudents(students, noPrefsClassroom);
      expect(result.map((s) => s.name)).toEqual(["C", "A", "B"]);
    });
  });
});

describe("spreadStudents", () => {
  it("inserts placeholders when more desks than students", () => {
    const matrix = [["desk", "desk", "desk", "desk"]];
    const students = [
      makeStudent({ name: "A" }),
      makeStudent({ name: "B" }),
    ];
    const result = spreadStudents(matrix, students);
    expect(result).toHaveLength(4);
    const names = result.map((s) => s.name);
    expect(names.filter((n) => n === "")).toHaveLength(2);
    expect(names.filter((n) => n !== "")).toHaveLength(2);
  });

  it("returns same list when desks equal students", () => {
    const matrix = [["desk", "desk"]];
    const students = [
      makeStudent({ name: "A" }),
      makeStudent({ name: "B" }),
    ];
    const result = spreadStudents(matrix, students);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.name)).toEqual(["A", "B"]);
  });

  it("returns same list when more students than desks", () => {
    const matrix = [["desk"]];
    const students = [
      makeStudent({ name: "A" }),
      makeStudent({ name: "B" }),
    ];
    const result = spreadStudents(matrix, students);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.name)).toEqual(["A", "B"]);
  });

  it("returns all placeholders when zero students with desks", () => {
    const matrix = [["desk", "desk", "desk"]];
    const result = spreadStudents(matrix, []);
    expect(result).toHaveLength(3);
    expect(result.every((s) => s.name === "")).toBe(true);
  });

  it("only counts 'desk' cells, ignoring nulls (aisles)", () => {
    const matrix = [["desk", null, "desk", null, "desk"]];
    const students = [makeStudent({ name: "A" })];
    const result = spreadStudents(matrix, students);
    // 3 desks, 1 student => 2 placeholders inserted
    expect(result).toHaveLength(3);
    expect(result.filter((s) => s.name === "")).toHaveLength(2);
  });

  it("does not mutate the original array", () => {
    const matrix = [["desk", "desk", "desk"]];
    const students = [makeStudent({ name: "A" })];
    const original = [...students];
    spreadStudents(matrix, students);
    expect(students).toEqual(original);
  });
});
