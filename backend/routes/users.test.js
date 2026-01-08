const request = require("supertest");
const app = require("../app");
const db = require("../db");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getAdminToken,
  getU1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("User Endpoints", () => {
  describe("GET /users", () => {
    test("Admin can get all users", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .expect(200);

      expect(res.body.users).toBeDefined();
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    test("Non-admin cannot get all users", async () => {
      await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(401);
    });

    test("Unauthenticated request fails", async () => {
      await request(app).get("/users").expect(401);
    });
  });

  describe("GET /users/:username", () => {
    test("Admin can get any user", async () => {
      const res = await request(app)
        .get("/users/u1")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .expect(200);

      expect(res.body.user.username).toBe("u1");
    });

    test("User can get their own data", async () => {
      const res = await request(app)
        .get("/users/u1")
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(200);

      expect(res.body.user.username).toBe("u1");
    });

    test("User cannot get other user data", async () => {
      await request(app)
        .get("/users/u2")
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(401);
    });
  });

  describe("PATCH /users/:username", () => {
    test("User can update their own profile", async () => {
      const res = await request(app)
        .patch("/users/u1")
        .send({ firstName: "Updated" })
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(200);

      expect(res.body.user.firstName).toBe("Updated");
    });

    test("User cannot update other user profile", async () => {
      await request(app)
        .patch("/users/u2")
        .send({ firstName: "Hacked" })
        .set("Authorization", `Bearer ${getU1Token()}`)
        .expect(401);
    });
  });
});
