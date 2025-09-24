const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Classroom = require("./classroom.js");
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

describe("getClassroom", () => {
  it("should return a classroom object", async () => {
    const username = "testuser";
    const expectedClassroom = {
      classroomId: 1,
      username: "testuser",
      seatAlphabetical: true,
      seatRandomize: false,
      seatHighLow: true,
      eseIsPriority: true,
      ellIsPriority: false,
      fiveZeroFourIsPriority: true,
      ebdIsPriority: false,
      seatingConfig: "seating config",
    };
    const db = {
      query: jest.fn().ReturnValueOnce({ rows: [expectedClassroom] }),
    };
    const classroom = await getClassroom(username, db);
    expect(classroom).toEqual(expectedClassroom);
  });

  const { updateClassroom } = require("./classroom");
});

describe("updateClassroom", () => {
  test("updates classroom data", async () => {
    const classroomId = 1;
    const data = {
      seatAlphabetical: true,
      seatRadomize: false,
      seatHighLow: true,
      eseIsPriority: true,
      ellIsPriority: false,
      fiveZeroFourIsPriority: true,
      ebdIsPriority: false,
      seatConfig: "null",
    };
    const updatedClassroom = await updateClassroom(classroomId, data);
    expect(updatedClassroom.seatAlphabetical).toBe(true);
    expect(updatedClassroom.seatRadomize).toBe(false);
    expect(updatedClassroom.seatHighLow).toBe(true);
    expect(updatedClassroom.eseIsPriority).toBe(true);
    expect(updatedClassroom.ellIsPriority).toBe(false);
    expect(updatedClassroom["fiveZeroFourIsPriority"]).toBe(true);
    expect(updatedClassroom.ebdIsPriority).toBe(false);
    expect(updatedClassroom.seatingConfig).toBe("null");
  });
});

describe("deleteClassroom", () => {
  it("deletes a classroom", async () => {
    await deleteClassroom(1);

    const result = await db.query("SELECT * FROM classrooms");
    expect(result.rows.length).toBe(0);
  });
});
