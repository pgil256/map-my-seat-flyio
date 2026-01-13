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

describe("Period Routes", () => {
  describe("GET /periods/:username", () => {
    test("User can get their own periods", async () => {
      const res = await request(app)
        .get("/periods/u1")
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(200);

      expect(res.body.periods).toBeDefined();
      expect(Array.isArray(res.body.periods)).toBe(true);
    });

    test("User cannot get another user's periods", async () => {
      await request(app)
        .get("/periods/u1")
        .set("Authorization", `Bearer ${getU2Token()}`)
        .expect(401);
    });

    test("Unauthenticated request fails", async () => {
      await request(app).get("/periods/u1").expect(401);
    });
  });

  describe("POST /periods/:username", () => {
    test("User can create a period", async () => {
      const res = await request(app)
        .post("/periods/u1")
        .send({
          schoolYear: "2024-2025",
          title: "New Period",
          number: 10,
        })
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(201);

      expect(res.body.period).toBeDefined();
      expect(res.body.period).toHaveProperty("periodId");
      expect(res.body.period.title).toBe("New Period");
    });

    test("Returns 400 for missing required fields", async () => {
      await request(app)
        .post("/periods/u1")
        .send({
          title: "Missing Fields",
        })
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(400);
    });
  });

  describe("GET /periods/:username/:periodId", () => {
    test("User can get a specific period", async () => {
      // First get periods to get an ID
      const listRes = await request(app)
        .get("/periods/u1")
        .set("Authorization", `Bearer ${getU1Token()}`);

      if (listRes.body.periods.length === 0) {
        return;
      }

      const periodId = listRes.body.periods[0].periodId;

      const res = await request(app)
        .get(`/periods/u1/${periodId}`)
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(200);

      expect(res.body.period).toBeDefined();
      expect(res.body.period.periodId).toBe(periodId);
    });
  });

  describe("PATCH /periods/:username/:periodId", () => {
    test("User can update a period", async () => {
      const listRes = await request(app)
        .get("/periods/u1")
        .set("Authorization", `Bearer ${getU1Token()}`);

      if (listRes.body.periods.length === 0) {
        return;
      }

      const periodId = listRes.body.periods[0].periodId;

      const res = await request(app)
        .patch(`/periods/u1/${periodId}`)
        .send({
          title: "Updated Period Title",
        })
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(200);

      expect(res.body.period.title).toBe("Updated Period Title");
    });
  });

  describe("DELETE /periods/:username/:periodId", () => {
    test("User can delete a period", async () => {
      // Create a period to delete
      const createRes = await request(app)
        .post("/periods/u1")
        .send({
          schoolYear: "2025-2026",
          title: "Period to Delete",
          number: 99,
        })
        .set("Authorization", `Bearer ${getU1Token()}`);

      const periodId = createRes.body.period.periodId;

      const res = await request(app)
        .delete(`/periods/u1/${periodId}`)
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(200);

      expect(res.body.deleted).toBe(String(periodId));
    });
  });
});
