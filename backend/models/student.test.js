const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
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

describe("Student", () => {
  describe("createStudent", () => {
    it("should insert a new student into the database", async () => {
      // Get a valid period_id from test data
      const periodResult = await db.query(
        `SELECT period_id FROM periods LIMIT 1`
      );

      if (periodResult.rows.length === 0) {
        return;
      }

      const periodId = periodResult.rows[0].period_id;
      const data = {
        periodId,
        name: "John Doe",
        grade: 10,
        gender: "male",
        isESE: false,
        has504: true,
        isELL: false,
        isEBD: true,
      };

      const student = await Student.createStudent(data);

      expect(student).toHaveProperty("studentId");
      expect(student).toHaveProperty("periodId", periodId);
      expect(student).toHaveProperty("name", data.name);
      expect(student).toHaveProperty("grade", data.grade);
      expect(student).toHaveProperty("gender", data.gender);
      expect(student).toHaveProperty("isESE", data.isESE);
      expect(student).toHaveProperty("has504", data.has504);
      expect(student).toHaveProperty("isELL", data.isELL);
      expect(student).toHaveProperty("isEBD", data.isEBD);
    });

    it("should convert grade to number if it is a string", async () => {
      const periodResult = await db.query(
        `SELECT period_id FROM periods LIMIT 1`
      );

      if (periodResult.rows.length === 0) {
        return;
      }

      const periodId = periodResult.rows[0].period_id;
      const data = {
        periodId,
        name: "Jane Doe",
        grade: "9th",
        gender: "female",
        isESE: true,
        has504: false,
        isELL: false,
        isEBD: false,
      };

      const student = await Student.createStudent(data);

      expect(student).toHaveProperty("grade", 9);
    });
  });

  describe("getStudentsByPeriod", () => {
    it("returns all students for a period", async () => {
      const periodResult = await db.query(
        `SELECT period_id FROM periods LIMIT 1`
      );

      if (periodResult.rows.length === 0) {
        return;
      }

      const periodId = periodResult.rows[0].period_id;
      const students = await Student.getStudentsByPeriod(periodId);

      expect(Array.isArray(students)).toBe(true);
    });
  });

  describe("deleteStudent", () => {
    it("should delete a student", async () => {
      // Create a student to delete
      const periodResult = await db.query(
        `SELECT period_id FROM periods LIMIT 1`
      );

      if (periodResult.rows.length === 0) {
        return;
      }

      const periodId = periodResult.rows[0].period_id;
      const student = await Student.createStudent({
        periodId,
        name: "Delete Me",
        grade: 8,
        gender: "other",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      });

      const deletedName = await Student.deleteStudent(student.studentId);
      expect(deletedName).toBe("Delete Me");
    });
  });
});
