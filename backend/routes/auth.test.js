const request = require("supertest");
const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
});

describe("POST /auth/token", () => {
  test("returns a token upon successful login", async () => {
    const user = await User.create({
      username: "testuser",
      password: "password",
      firstName: "Test",
      lastName: "User",
      email: "testuser@example.com",
      isAdmin: false,
    });

    const response = await request(app)
      .post("/auth/token")
      .send({
        username: "testuser",
        password: "password",
      })
      .expect(200);

    expect(response.body).toHaveProperty("token");
    expect(response.body.token).toEqual(createToken(user));
  });

  test("returns a 400 error if invalid login credentials are provided", async () => {
    const response = await request(app)
      .post("/auth/token")
      .send({
        username: "testuser",
        password: "wrongpassword",
      })
      .expect(400);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("Invalid username/password");
  });
});

describe("POST /authregister", () => {
  test("returns a token upon successful registration", async () => {
    const response = await request(app)
      .post("/authregister")
      .send({
        username: "newuser",
        password: "password",
        firstName: "New",
        lastName: "User",
        email: "newuser@example.com",
      })
      .expect(201);

    expect(response.body).toHaveProperty("token");
  });

  test("returns a 400 error if invalid registration data is provided", async () => {
    const response = await request(app)
      .post("/authregister")
      .send({
        username: "newuser",
        password: "password",
        firstName: "New",
        lastName: "User",
      })
      .expect(400);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain('instance requires property "email"');
  });
});
