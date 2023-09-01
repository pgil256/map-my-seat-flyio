const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");

const Student = require("./students");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const { createStudent } = require("./students");

describe("createStudent", () => {
  it("should insert a new student into the database", async () => {
    const data = {
      periodId: 1,
      name: "John Doe",
      grade: 10,
      gender: "male",
      isESE: false,
      has504: true,
      isELL: false,
      isEBD: true,
    };

    const student = await createStudent(data);

    expect(student).toHaveProperty("studentId");
    expect(student).toHaveProperty("periodId", data.periodId);
    expect(student).toHaveProperty("name", data.name);
    expect(student).toHaveProperty("grade", data.grade);
    expect(student).toHaveProperty("gender", data.gender);
    expect(student).toHaveProperty("isESE", data.isESE);
    expect(student).toHaveProperty("has504", data.has504);
    expect(student).toHaveProperty("isELL", data.isELL);
    expect(student).toHaveProperty("isEBD", data.isEBD);
  });

  it("should convert grade to number if it is a string", async () => {
    const data = {
      periodId: 1,
      name: "Jane Doe",
      grade: "9th",
      gender: "female",
      isESE: true,
      has504: false,
      isELL: false,
      isEBD: false,
    };

    const student = await createStudent(data);

    expect(student).toHaveProperty("grade", 9);
  });
});

const { updateStudents } = require("./students");
const db = require("./db");

describe("updateStudents", () => {
  beforeEach(async () => {
    // Clear the students table before each test
    await db.query("DELETE FROM students");
  });

  it("updates a student", async () => {
    // Insert a student into the database
    const insertResult = await db.query(`
      INSERT INTO students (name, grade, gender, is_ESE, has_504, is_ELL, is_EBD)
      VALUES ('John Doe', 10, 'M', true, false, true, false)
      RETURNING id
    `);
    const studentId = insertResult.rows[0].id;

    // Update the student's name and grade
    const updatedStudent = await updateStudents(studentId, {
      name: "Jane Doe",
      grade: 11,
    });

    // Verify that the student was updated correctly
    expect(updatedStudent).toEqual({
      name: "Jane Doe",
      grade: 11,
      gender: "M",
      isESE: true,
      has504: false,
      isELL: true,
      isEBD: false,
    });

    // Verify that the student was updated in the database
    const selectResult = await db.query(
      `
      SELECT name, grade, gender, is_ESE, has_504, is_ELL, is_EBD
      FROM students
      WHERE id = $1
    `,
      [studentId]
    );
    expect(selectResult.rows[0]).toEqual({
      name: "Jane Doe",
      grade: 11,
      gender: "M",
      is_ese: true,
      has_504: false,
      is_ell: true,
      is_ebd: false,
    });
  });
});

describe("deleteStudent", () => {
  it("should delete a student", async () => {
    const studentId = 1;
    const expectedName = "John Doe";
    const dbQueryStub = sinon.stub(db, "query").resolves({
      rows: [{ name: expectedName }],
    });

    // Act
    const result = await deleteStudent(studentId);

    expect(result).to.equal(expectedName);
  });
});
