"use strict";

const request = require("supertest");
const app = require("./app");
const db = require("./db");

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
});

describe("Auth Routes", () => {
  test("POST /auth/token - success", async () => {
    const response = await request(app)
      .post("/auth/token")
      .send({ username: "testuser", password: "testpassword" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("POST /auth/token - invalid credentials", async () => {
    const response = await request(app)
      .post("/auth/token")
      .send({ username: "testuser", password: "wrongpassword" });
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error");
  });
});

describe("Users Routes", () => {
  test("GET /users - success", async () => {
    const response = await request(app).get("/users");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("users");
  });

  test("GET /users/:id - success", async () => {
    const response = await request(app).get("/users/1");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user");
  });

  test("GET /users/:id - user not found", async () => {
    const response = await request(app).get("/users/999");
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error");
  });
});

describe("Classrooms Routes", () => {
  test("GET /classrooms - success", async () => {
    const response = await request(app).get("/classrooms");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("classrooms");
  });

  test("GET /classrooms/:classroomId - success", async () => {
    const response = await request(app).get("/classrooms/1");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("classroom");
  });
});

describe("Periods Routes", () => {
  test("GET /periods - success", async () => {
    const response = await request(app).get("/periods");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("periods");
  });

  test("GET /periods/:periodId - success", async () => {
    const response = await request(app).get("/periods/1");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("period");
  });
});

describe("Error Handlers", () => {
  test("404 Error Handler", async () => {
    const response = await request(app).get("/nonexistentroute");
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  test("Generic Error Handler", async () => {
    const response = await request(app).get("/users/invalidid");
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});