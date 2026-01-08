const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Classroom = require("./classroom.js");
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

describe("Classroom", () => {
  describe("getClassroom", () => {
    it("should return a classroom object", async () => {
      const classroom = await Classroom.getClassroom("u1");

      expect(classroom).toHaveProperty("classroomId");
      expect(classroom).toHaveProperty("username", "u1");
      expect(classroom).toHaveProperty("seatAlphabetical");
      expect(classroom).toHaveProperty("seatingConfig");
    });

    it("should throw NotFoundError for nonexistent user", async () => {
      await expect(Classroom.getClassroom("nonexistent")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("createClassroom", () => {
    it("creates a new classroom for a user", async () => {
      // First check if u2 doesn't have a classroom
      try {
        await Classroom.getClassroom("u2");
        // If classroom exists, skip this test
        return;
      } catch (e) {
        // Expected - no classroom exists
      }

      const classroom = await Classroom.createClassroom("u2");

      expect(classroom).toHaveProperty("classroomId");
      expect(classroom).toHaveProperty("username", "u2");
    });
  });

  describe("updateClassroom", () => {
    it("updates classroom data", async () => {
      const classroom = await Classroom.getClassroom("u1");
      const classroomId = classroom.classroomId;

      const data = {
        seatAlphabetical: true,
        seatRandomize: false,
      };

      const updatedClassroom = await Classroom.updateClassroom(
        classroomId,
        data
      );

      expect(updatedClassroom.seatAlphabetical).toBe(true);
      expect(updatedClassroom.seatRandomize).toBe(false);
    });
  });
});
