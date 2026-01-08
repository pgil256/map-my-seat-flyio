const request = require("supertest");
const app = require("../app");
const db = require("../db");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getU1Token,
  getU2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Classroom Routes", () => {
  describe("GET /classrooms/:username", () => {
    test("User can get their own classroom", async () => {
      const res = await request(app)
        .get("/classrooms/u1")
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(200);

      expect(res.body.classroom).toBeDefined();
      expect(res.body.classroom).toHaveProperty("classroomId");
      expect(res.body.classroom).toHaveProperty("seatingConfig");
    });

    test("User cannot get another user's classroom", async () => {
      await request(app)
        .get("/classrooms/u1")
        .set("Authorization", `Bearer ${getU2Token()}`)
        .expect(401);
    });

    test("Unauthenticated request fails", async () => {
      await request(app).get("/classrooms/u1").expect(401);
    });
  });

  describe("POST /classrooms/:username", () => {
    test("User can create a classroom", async () => {
      const res = await request(app)
        .post("/classrooms/u2")
        .set("Authorization", `Bearer ${getU2Token()}`)
        .expect(201);

      expect(res.body.classroom).toBeDefined();
      expect(res.body.classroom).toHaveProperty("classroomId");
    });
  });

  describe("PATCH /classrooms/:username/:classroomId", () => {
    test("User can update their classroom", async () => {
      // First get the classroom to get its ID
      const getRes = await request(app)
        .get("/classrooms/u1")
        .set("Authorization", `Bearer ${getU1Token()}`);

      const classroomId = getRes.body.classroom.classroomId;

      const res = await request(app)
        .patch(`/classrooms/u1/${classroomId}`)
        .send({
          seatAlphabetical: false,
          seatRandomize: true,
        })
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(200);

      expect(res.body.classroom.seatAlphabetical).toBe(false);
      expect(res.body.classroom.seatRandomize).toBe(true);
    });
  });
});
