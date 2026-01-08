"use strict";

const request = require("supertest");
const app = require("./app");

describe("App", () => {
  describe("SPA Catch-all", () => {
    test("returns 200 for unknown routes (serves SPA)", async () => {
      const response = await request(app).get("/nonexistent-route-12345");
      // SPA catch-all serves index.html with 200
      expect(response.statusCode).toBe(200);
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
