"use strict";

const request = require("supertest");
const app = require("./app");

describe("App", () => {
  describe("404 Handler", () => {
    test("returns 404 for nonexistent route", async () => {
      const response = await request(app).get("/nonexistent-route-12345");
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Health Check", () => {
    test("app responds to requests", async () => {
      // Test that the auth routes are mounted
      const response = await request(app)
        .post("/auth/token")
        .send({ username: "test", password: "test" });
      // Either 401 (unauthorized) or 500 (db not available) - but not 404
      expect([401, 500]).toContain(response.statusCode);
    });
  });
});
