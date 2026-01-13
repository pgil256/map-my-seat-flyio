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

// Helper to get test data
async function getTestData() {
  const period = await db("periods")
    .where("user_username", "u1")
    .andWhere("number", 1)
    .first();
  const students = await db("students")
    .where("period_id", period.period_id)
    .select("student_id");
  return { periodId: period.period_id, studentIds: students.map(s => s.student_id) };
}

describe("POST /constraints/:username/:periodId", () => {
  test("works for correct user - separate constraint", async () => {
    const { periodId, studentIds } = await getTestData();

    const resp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toHaveProperty("constraint");
    expect(resp.body.constraint).toHaveProperty("constraintType", "separate");
  });

  test("works for correct user - pair constraint", async () => {
    const { periodId, studentIds } = await getTestData();

    const resp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "pair",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body.constraint).toHaveProperty("constraintType", "pair");
  });

  test("works for admin", async () => {
    const { periodId, studentIds } = await getTestData();

    const resp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(201);
  });

  test("unauth for wrong user", async () => {
    const { periodId, studentIds } = await getTestData();

    const resp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const { periodId, studentIds } = await getTestData();

    const resp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      });

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with invalid constraint type", async () => {
    const { periodId, studentIds } = await getTestData();

    const resp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "invalid",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });
});

describe("GET /constraints/:username/:periodId", () => {
  test("works for correct user", async () => {
    const { periodId } = await getTestData();

    const resp = await request(app)
      .get(`/constraints/u1/${periodId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toHaveProperty("constraints");
    expect(Array.isArray(resp.body.constraints)).toBe(true);
  });

  test("works for admin", async () => {
    const { periodId } = await getTestData();

    const resp = await request(app)
      .get(`/constraints/u1/${periodId}`)
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for wrong user", async () => {
    const { periodId } = await getTestData();

    const resp = await request(app)
      .get(`/constraints/u1/${periodId}`)
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("returns created constraints", async () => {
    const { periodId, studentIds } = await getTestData();

    // Create a constraint
    await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const resp = await request(app)
      .get(`/constraints/u1/${periodId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.constraints.length).toBeGreaterThan(0);
  });
});

describe("PATCH /constraints/:username/:periodId/:constraintId", () => {
  test("works for correct user", async () => {
    const { periodId, studentIds } = await getTestData();

    // Create a constraint first
    const createResp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const constraintId = createResp.body.constraint.constraintId;

    // Update it
    const resp = await request(app)
      .patch(`/constraints/u1/${periodId}/${constraintId}`)
      .send({ constraintType: "pair" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.constraint).toHaveProperty("constraintType", "pair");
  });

  test("bad request with invalid constraint type", async () => {
    const { periodId, studentIds } = await getTestData();

    // Create a constraint first
    const createResp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const constraintId = createResp.body.constraint.constraintId;

    const resp = await request(app)
      .patch(`/constraints/u1/${periodId}/${constraintId}`)
      .send({ constraintType: "invalid" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for wrong user", async () => {
    const { periodId, studentIds } = await getTestData();

    const createResp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const constraintId = createResp.body.constraint.constraintId;

    const resp = await request(app)
      .patch(`/constraints/u1/${periodId}/${constraintId}`)
      .send({ constraintType: "pair" })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });
});

describe("DELETE /constraints/:username/:periodId/:constraintId", () => {
  test("works for correct user", async () => {
    const { periodId, studentIds } = await getTestData();

    // Create a constraint first
    const createResp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const constraintId = createResp.body.constraint.constraintId;

    const resp = await request(app)
      .delete(`/constraints/u1/${periodId}/${constraintId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: String(constraintId) });
  });

  test("works for admin", async () => {
    const { periodId, studentIds } = await getTestData();

    const createResp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const constraintId = createResp.body.constraint.constraintId;

    const resp = await request(app)
      .delete(`/constraints/u1/${periodId}/${constraintId}`)
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for wrong user", async () => {
    const { periodId, studentIds } = await getTestData();

    const createResp = await request(app)
      .post(`/constraints/u1/${periodId}`)
      .send({
        studentId1: studentIds[0],
        studentId2: studentIds[1],
        constraintType: "separate",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const constraintId = createResp.body.constraint.constraintId;

    const resp = await request(app)
      .delete(`/constraints/u1/${periodId}/${constraintId}`)
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found for non-existent constraint", async () => {
    const { periodId } = await getTestData();

    const resp = await request(app)
      .delete(`/constraints/u1/${periodId}/99999`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});
