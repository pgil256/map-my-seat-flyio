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
      const periodResult = await db("periods").select("period_id").first();

      if (!periodResult) {
        return;
      }

      const periodId = periodResult.period_id;
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

    it("should handle numeric grade values", async () => {
      const periodResult = await db("periods").select("period_id").first();

      if (!periodResult) {
        return;
      }

      const periodId = periodResult.period_id;
      const data = {
        periodId,
        name: "Jane Doe",
        grade: 9,
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

  describe("updateStudent", () => {
    it("should update a student", async () => {
      const periodResult = await db("periods").select("period_id").first();

      if (!periodResult) {
        return;
      }

      const periodId = periodResult.period_id;
      const student = await Student.createStudent({
        periodId,
        name: "Update Me",
        grade: 10,
        gender: "male",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      });

      const updated = await Student.updateStudent(student.studentId, {
        name: "Updated Name",
        grade: 11,
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.grade).toBe(11);
    });

    it("should throw NotFoundError for non-existent student", async () => {
      await expect(
        Student.updateStudent(99999, { name: "Test" })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteStudent", () => {
    it("should delete a student", async () => {
      const periodResult = await db("periods").select("period_id").first();

      if (!periodResult) {
        return;
      }

      const periodId = periodResult.period_id;
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

      await Student.deleteStudent(student.studentId);

      // Verify student is deleted
      const result = await db("students")
        .where("student_id", student.studentId)
        .first();
      expect(result).toBeUndefined();
    });

    it("should throw NotFoundError for non-existent student", async () => {
      await expect(Student.deleteStudent(99999)).rejects.toThrow(NotFoundError);
    });
  });
});
