const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const StudentConstraint = require("./studentConstraint.js");
const Student = require("./student.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("StudentConstraint", () => {
  // Helper to create two students for constraint testing
  async function createTwoStudents() {
    const periodResult = await db.raw(
      `SELECT period_id FROM periods LIMIT 1`
    );
    const periodId = periodResult.rows[0].period_id;

    const student1 = await Student.createStudent({
      periodId,
      name: "Student One",
      grade: 10,
      gender: "male",
      isESE: false,
      has504: false,
      isELL: false,
      isEBD: false,
    });

    const student2 = await Student.createStudent({
      periodId,
      name: "Student Two",
      grade: 10,
      gender: "female",
      isESE: false,
      has504: false,
      isELL: false,
      isEBD: false,
    });

    return { student1, student2, periodId };
  }

  describe("createConstraint", () => {
    it("should create a 'separate' constraint between two students", async () => {
      const { student1, student2 } = await createTwoStudents();

      const constraint = await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      expect(constraint).toHaveProperty("constraintId");
      expect(constraint).toHaveProperty("constraintType", "separate");
      expect(constraint).toHaveProperty("createdAt");
      // IDs should be ordered (smaller first)
      const expectedId1 = Math.min(student1.studentId, student2.studentId);
      const expectedId2 = Math.max(student1.studentId, student2.studentId);
      expect(constraint.studentId1).toBe(expectedId1);
      expect(constraint.studentId2).toBe(expectedId2);
    });

    it("should create a 'pair' constraint between two students", async () => {
      const { student1, student2 } = await createTwoStudents();

      const constraint = await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "pair"
      );

      expect(constraint).toHaveProperty("constraintId");
      expect(constraint).toHaveProperty("constraintType", "pair");
    });

    it("should normalize student ID order regardless of input order", async () => {
      const { student1, student2 } = await createTwoStudents();

      // Pass IDs in reverse order (larger first)
      const largerFirst = Math.max(student1.studentId, student2.studentId);
      const smallerFirst = Math.min(student1.studentId, student2.studentId);

      const constraint = await StudentConstraint.createConstraint(
        largerFirst,
        smallerFirst,
        "separate"
      );

      // Should still store with smaller ID first
      expect(constraint.studentId1).toBe(smallerFirst);
      expect(constraint.studentId2).toBe(largerFirst);
    });

    it("should throw BadRequestError if constraint already exists", async () => {
      const { student1, student2 } = await createTwoStudents();

      await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      await expect(
        StudentConstraint.createConstraint(
          student1.studentId,
          student2.studentId,
          "pair"
        )
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw BadRequestError for duplicate even with reversed order", async () => {
      const { student1, student2 } = await createTwoStudents();

      await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      // Try creating with reversed order
      await expect(
        StudentConstraint.createConstraint(
          student2.studentId,
          student1.studentId,
          "separate"
        )
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getConstraintsByPeriod", () => {
    it("should return all constraints for students in a period", async () => {
      const { student1, student2, periodId } = await createTwoStudents();

      await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      const constraints = await StudentConstraint.getConstraintsByPeriod(periodId);

      expect(Array.isArray(constraints)).toBe(true);
      expect(constraints.length).toBe(1);
      expect(constraints[0]).toHaveProperty("constraintId");
      expect(constraints[0]).toHaveProperty("studentName1", "Student One");
      expect(constraints[0]).toHaveProperty("studentName2", "Student Two");
      expect(constraints[0]).toHaveProperty("constraintType", "separate");
    });

    it("should return multiple constraints for a period", async () => {
      const { student1, student2, periodId } = await createTwoStudents();

      // Create a third student
      const student3 = await Student.createStudent({
        periodId,
        name: "Student Three",
        grade: 10,
        gender: "other",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      });

      await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      await StudentConstraint.createConstraint(
        student1.studentId,
        student3.studentId,
        "pair"
      );

      const constraints = await StudentConstraint.getConstraintsByPeriod(periodId);

      expect(constraints.length).toBe(2);
    });

    it("should return empty array for period with no constraints", async () => {
      const periodResult = await db.raw(
        `SELECT period_id FROM periods LIMIT 1`
      );
      const periodId = periodResult.rows[0].period_id;

      const constraints = await StudentConstraint.getConstraintsByPeriod(periodId);

      expect(Array.isArray(constraints)).toBe(true);
      expect(constraints.length).toBe(0);
    });

    it("should return empty array for non-existent period", async () => {
      const constraints = await StudentConstraint.getConstraintsByPeriod(999999);

      expect(Array.isArray(constraints)).toBe(true);
      expect(constraints.length).toBe(0);
    });
  });

  describe("getConstraintsForStudent", () => {
    it("should return constraints where student is studentId1", async () => {
      const { student1, student2 } = await createTwoStudents();

      await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      // The smaller ID becomes studentId1
      const smallerId = Math.min(student1.studentId, student2.studentId);
      const constraints = await StudentConstraint.getConstraintsForStudent(smallerId);

      expect(Array.isArray(constraints)).toBe(true);
      expect(constraints.length).toBe(1);
      expect(constraints[0]).toHaveProperty("constraintType", "separate");
    });

    it("should return constraints where student is studentId2", async () => {
      const { student1, student2 } = await createTwoStudents();

      await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      // The larger ID becomes studentId2
      const largerId = Math.max(student1.studentId, student2.studentId);
      const constraints = await StudentConstraint.getConstraintsForStudent(largerId);

      expect(Array.isArray(constraints)).toBe(true);
      expect(constraints.length).toBe(1);
    });

    it("should return all constraints involving a student", async () => {
      const { student1, student2, periodId } = await createTwoStudents();

      const student3 = await Student.createStudent({
        periodId,
        name: "Student Three",
        grade: 10,
        gender: "other",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      });

      await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      await StudentConstraint.createConstraint(
        student1.studentId,
        student3.studentId,
        "pair"
      );

      const constraints = await StudentConstraint.getConstraintsForStudent(student1.studentId);

      expect(constraints.length).toBe(2);
    });

    it("should return empty array for student with no constraints", async () => {
      const { student1 } = await createTwoStudents();

      const constraints = await StudentConstraint.getConstraintsForStudent(student1.studentId);

      expect(Array.isArray(constraints)).toBe(true);
      expect(constraints.length).toBe(0);
    });

    it("should return empty array for non-existent student", async () => {
      const constraints = await StudentConstraint.getConstraintsForStudent(999999);

      expect(Array.isArray(constraints)).toBe(true);
      expect(constraints.length).toBe(0);
    });
  });

  describe("updateConstraint", () => {
    it("should update constraint type from 'separate' to 'pair'", async () => {
      const { student1, student2 } = await createTwoStudents();

      const created = await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      const updated = await StudentConstraint.updateConstraint(
        created.constraintId,
        "pair"
      );

      expect(updated.constraintId).toBe(created.constraintId);
      expect(updated.constraintType).toBe("pair");
    });

    it("should update constraint type from 'pair' to 'separate'", async () => {
      const { student1, student2 } = await createTwoStudents();

      const created = await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "pair"
      );

      const updated = await StudentConstraint.updateConstraint(
        created.constraintId,
        "separate"
      );

      expect(updated.constraintType).toBe("separate");
    });

    it("should throw NotFoundError for non-existent constraint", async () => {
      await expect(
        StudentConstraint.updateConstraint(999999, "pair")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteConstraint", () => {
    it("should delete an existing constraint", async () => {
      const { student1, student2 } = await createTwoStudents();

      const created = await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      await StudentConstraint.deleteConstraint(created.constraintId);

      // Verify deletion by trying to get constraints for the student
      const constraints = await StudentConstraint.getConstraintsForStudent(student1.studentId);
      expect(constraints.length).toBe(0);
    });

    it("should throw NotFoundError for non-existent constraint", async () => {
      await expect(
        StudentConstraint.deleteConstraint(999999)
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when trying to delete already deleted constraint", async () => {
      const { student1, student2 } = await createTwoStudents();

      const created = await StudentConstraint.createConstraint(
        student1.studentId,
        student2.studentId,
        "separate"
      );

      await StudentConstraint.deleteConstraint(created.constraintId);

      await expect(
        StudentConstraint.deleteConstraint(created.constraintId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
