const request = require("supertest");
const app = require("../app");
const db = require("../db");
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

describe("POST /auth/token", () => {
  test("returns a token upon successful login", async () => {
    const response = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
        password: "password1",
      })
      .expect(200);

    expect(response.body).toHaveProperty("token");
  });

  test("returns 401 for invalid credentials", async () => {
    const response = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
        password: "wrongpassword",
      })
      .expect(401);

    expect(response.body).toHaveProperty("error");
  });
});

describe("POST /auth/register", () => {
  test("returns a token upon successful registration", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser",
        password: "password123",
        title: "Mr.",
        firstName: "New",
        lastName: "User",
        email: "newuser@example.com",
      })
      .expect(201);

    expect(response.body).toHaveProperty("token");
  });

  test("returns 400 for missing required fields", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser",
        password: "password",
      })
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });

  test("returns 400 for duplicate username", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        username: "u1",
        password: "password123",
        title: "Mr.",
        firstName: "Dupe",
        lastName: "User",
        email: "dupe@example.com",
      })
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });
});
