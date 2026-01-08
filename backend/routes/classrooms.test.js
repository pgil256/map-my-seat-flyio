"use strict";

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
  getAdminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /classrooms/:username/all", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .get("/classrooms/u1/all")
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toHaveProperty("classrooms");
    expect(Array.isArray(resp.body.classrooms)).toBe(true);
  });

  test("works for admin", async () => {
    const resp = await request(app)
      .get("/classrooms/u1/all")
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
      .get("/classrooms/u1/all")
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const resp = await request(app).get("/classrooms/u1/all");
    expect(resp.statusCode).toEqual(401);
  });
});

describe("GET /classrooms/:username", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .get("/classrooms/u1")
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toHaveProperty("classroom");
  });

  test("works for admin", async () => {
    const resp = await request(app)
      .get("/classrooms/u1")
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
      .get("/classrooms/u1")
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });
});

describe("POST /classrooms/:username", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .post("/classrooms/u1")
      .send({ name: "New Classroom" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toHaveProperty("classroom");
    expect(resp.body.classroom).toHaveProperty("name", "New Classroom");
  });

  test("works for admin", async () => {
    const resp = await request(app)
      .post("/classrooms/u1")
      .send({ name: "Admin Created Classroom" })
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(201);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
      .post("/classrooms/u1")
      .send({ name: "Unauthorized" })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const resp = await request(app)
      .post("/classrooms/u1")
      .send({ name: "Anonymous" });

    expect(resp.statusCode).toEqual(401);
  });
});

describe("PATCH /classrooms/:username/:classroomId", () => {
  test("works for correct user", async () => {
    // Get an existing classroom ID
    const classroom = await db("classrooms")
      .where("user_username", "u1")
      .first();

    const resp = await request(app)
      .patch(`/classrooms/u1/${classroom.classroom_id}`)
      .send({ seatAlphabetical: false })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toHaveProperty("classroom");
  });

  test("unauth for wrong user", async () => {
    const classroom = await db("classrooms")
      .where("user_username", "u1")
      .first();

    const resp = await request(app)
      .patch(`/classrooms/u1/${classroom.classroom_id}`)
      .send({ seatAlphabetical: false })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });
});

describe("DELETE /classrooms/:username/:classroomId", () => {
  test("works for correct user", async () => {
    // Create a classroom to delete
    const createResp = await request(app)
      .post("/classrooms/u1")
      .send({ name: "To Delete" })
      .set("authorization", `Bearer ${getU1Token()}`);

    const classroomId = createResp.body.classroom.classroomId;

    const resp = await request(app)
      .delete(`/classrooms/u1/${classroomId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: String(classroomId) });
  });

  test("unauth for wrong user", async () => {
    const classroom = await db("classrooms")
      .where("user_username", "u1")
      .first();

    const resp = await request(app)
      .delete(`/classrooms/u1/${classroom.classroom_id}`)
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });
});
