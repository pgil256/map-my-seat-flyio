"use strict";

const request = require("supertest");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getU1Token,
  getU2Token,
  getAdminToken,
  getTestPeriodId,
  getTestStudentIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /periods/:username/:periodId/students */

describe("POST /periods/:username/:periodId/students", () => {
  const newStudent = {
    name: "New Student",
    grade: 9,
    gender: "F",
    isESE: true,
    has504: false,
    isELL: true,
    isEBD: false,
  };

  test("works for correct user", async () => {
    const periodId = getTestPeriodId();
    const resp = await request(app)
      .post(`/periods/u1/${periodId}/students`)
      .send({ ...newStudent, periodId })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toHaveProperty("student");
    expect(resp.body.student).toHaveProperty("name", "New Student");
    expect(resp.body.student).toHaveProperty("grade", 9);
    expect(resp.body.student).toHaveProperty("gender", "F");
    expect(resp.body.student).toHaveProperty("isESE", true);
    expect(resp.body.student).toHaveProperty("has504", false);
    expect(resp.body.student).toHaveProperty("isELL", true);
    expect(resp.body.student).toHaveProperty("isEBD", false);
    expect(resp.body.student).toHaveProperty("studentId");
    expect(resp.body.student).toHaveProperty("periodId", periodId);
  });

  test("works for admin", async () => {
    const periodId = getTestPeriodId();
    const resp = await request(app)
      .post(`/periods/u1/${periodId}/students`)
      .send({ ...newStudent, periodId })
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toHaveProperty("student");
    expect(resp.body.student).toHaveProperty("name", "New Student");
  });

  test("unauth for wrong user", async () => {
    const periodId = getTestPeriodId();
    const resp = await request(app)
      .post(`/periods/u1/${periodId}/students`)
      .send({ ...newStudent, periodId })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const periodId = getTestPeriodId();
    const resp = await request(app)
      .post(`/periods/u1/${periodId}/students`)
      .send({ ...newStudent, periodId });

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing required fields", async () => {
    const periodId = getTestPeriodId();
    const resp = await request(app)
      .post(`/periods/u1/${periodId}/students`)
      .send({ name: "Incomplete Student" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data types", async () => {
    const periodId = getTestPeriodId();
    const resp = await request(app)
      .post(`/periods/u1/${periodId}/students`)
      .send({
        periodId,
        name: "Bad Student",
        grade: "not-a-number",
        gender: "F",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** PATCH /periods/:username/:periodId/students/:studentId */

describe("PATCH /periods/:username/:periodId/students/:studentId", () => {
  test("works for correct user", async () => {
    const periodId = getTestPeriodId();
    const studentId = getTestStudentIds()[0];

    const resp = await request(app)
      .patch(`/periods/u1/${periodId}/students/${studentId}`)
      .send({
        studentId,
        name: "Updated Name",
        grade: 11,
        gender: "F",
        isESE: true,
        has504: true,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toHaveProperty("student");
    expect(resp.body.student).toHaveProperty("name", "Updated Name");
    expect(resp.body.student).toHaveProperty("grade", 11);
    expect(resp.body.student).toHaveProperty("isESE", true);
  });

  test("works for admin", async () => {
    const periodId = getTestPeriodId();
    const studentId = getTestStudentIds()[0];

    const resp = await request(app)
      .patch(`/periods/u1/${periodId}/students/${studentId}`)
      .send({
        studentId,
        name: "Admin Updated",
        grade: 10,
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.student).toHaveProperty("name", "Admin Updated");
  });

  test("unauth for wrong user", async () => {
    const periodId = getTestPeriodId();
    const studentId = getTestStudentIds()[0];

    const resp = await request(app)
      .patch(`/periods/u1/${periodId}/students/${studentId}`)
      .send({
        studentId,
        name: "Hacked",
        grade: 10,
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const periodId = getTestPeriodId();
    const studentId = getTestStudentIds()[0];

    const resp = await request(app)
      .patch(`/periods/u1/${periodId}/students/${studentId}`)
      .send({
        studentId,
        name: "Anonymous",
        grade: 10,
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      });

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with invalid data types", async () => {
    const periodId = getTestPeriodId();
    const studentId = getTestStudentIds()[0];

    const resp = await request(app)
      .patch(`/periods/u1/${periodId}/students/${studentId}`)
      .send({
        studentId,
        name: "Bad Update",
        grade: "not-a-number",
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("not found for nonexistent student", async () => {
    const periodId = getTestPeriodId();

    const resp = await request(app)
      .patch(`/periods/u1/${periodId}/students/0`)
      .send({
        studentId: 0,
        name: "Ghost",
        grade: 10,
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** DELETE /periods/:username/:periodId/students/:studentId */

describe("DELETE /periods/:username/:periodId/students/:studentId", () => {
  test("works for correct user", async () => {
    const periodId = getTestPeriodId();
    const studentId = getTestStudentIds()[0];

    const resp = await request(app)
      .delete(`/periods/u1/${periodId}/students/${studentId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: String(studentId) });
  });

  test("works for admin", async () => {
    const periodId = getTestPeriodId();
    const studentId = getTestStudentIds()[1];

    const resp = await request(app)
      .delete(`/periods/u1/${periodId}/students/${studentId}`)
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: String(studentId) });
  });

  test("unauth for wrong user", async () => {
    const periodId = getTestPeriodId();
    const studentId = getTestStudentIds()[0];

    const resp = await request(app)
      .delete(`/periods/u1/${periodId}/students/${studentId}`)
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const periodId = getTestPeriodId();
    const studentId = getTestStudentIds()[0];

    const resp = await request(app)
      .delete(`/periods/u1/${periodId}/students/${studentId}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found for nonexistent student", async () => {
    const periodId = getTestPeriodId();

    const resp = await request(app)
      .delete(`/periods/u1/${periodId}/students/0`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });

  test("create then delete flow", async () => {
    const periodId = getTestPeriodId();

    // Create a student
    const createResp = await request(app)
      .post(`/periods/u1/${periodId}/students`)
      .send({
        periodId,
        name: "Temp Student",
        grade: 8,
        gender: "F",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(createResp.statusCode).toEqual(201);
    const newStudentId = createResp.body.student.studentId;

    // Delete the student
    const deleteResp = await request(app)
      .delete(`/periods/u1/${periodId}/students/${newStudentId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(deleteResp.statusCode).toEqual(200);
    expect(deleteResp.body).toEqual({ deleted: String(newStudentId) });

    // Verify deletion - try to update deleted student
    const patchResp = await request(app)
      .patch(`/periods/u1/${periodId}/students/${newStudentId}`)
      .send({
        studentId: newStudentId,
        name: "Ghost",
        grade: 8,
        gender: "F",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(patchResp.statusCode).toEqual(404);
  });
});
