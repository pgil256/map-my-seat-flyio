"use strict";

const {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
  ValidationError,
} = require("./expressError");

describe("ExpressError", () => {
  test("creates error with message, status, and code", () => {
    const err = new ExpressError("Test error", 418, "TEST_CODE");
    expect(err.message).toBe("Test error");
    expect(err.status).toBe(418);
    expect(err.code).toBe("TEST_CODE");
  });

  test("defaults code to UNKNOWN_ERROR", () => {
    const err = new ExpressError("Test", 500);
    expect(err.code).toBe("UNKNOWN_ERROR");
  });

  test("is instance of Error", () => {
    const err = new ExpressError("Test", 500);
    expect(err instanceof Error).toBeTruthy();
  });

  test("toJSON returns correct object", () => {
    const err = new ExpressError("Test error", 418, "TEST_CODE");
    expect(err.toJSON()).toEqual({
      error: "Test error",
      code: "TEST_CODE",
      status: 418,
    });
  });
});

describe("NotFoundError", () => {
  test("creates 404 error with default message", () => {
    const err = new NotFoundError();
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not Found");
    expect(err.code).toBe("NOT_FOUND");
  });

  test("creates 404 error with custom message", () => {
    const err = new NotFoundError("Resource missing");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Resource missing");
    expect(err.code).toBe("NOT_FOUND");
  });

  test("is instance of ExpressError", () => {
    const err = new NotFoundError();
    expect(err instanceof ExpressError).toBeTruthy();
  });
});

describe("UnauthorizedError", () => {
  test("creates 401 error with default message", () => {
    const err = new UnauthorizedError();
    expect(err.status).toBe(401);
    expect(err.message).toBe("Unauthorized");
    expect(err.code).toBe("UNAUTHORIZED");
  });

  test("creates 401 error with custom message", () => {
    const err = new UnauthorizedError("Invalid token");
    expect(err.status).toBe(401);
    expect(err.message).toBe("Invalid token");
  });
});

describe("BadRequestError", () => {
  test("creates 400 error with default message", () => {
    const err = new BadRequestError();
    expect(err.status).toBe(400);
    expect(err.message).toBe("Bad Request");
    expect(err.code).toBe("BAD_REQUEST");
  });

  test("creates 400 error with custom message", () => {
    const err = new BadRequestError("Invalid input");
    expect(err.status).toBe(400);
    expect(err.message).toBe("Invalid input");
  });
});

describe("ForbiddenError", () => {
  test("creates 403 error with default message", () => {
    const err = new ForbiddenError();
    expect(err.status).toBe(403);
    expect(err.message).toBe("Forbidden");
    expect(err.code).toBe("FORBIDDEN");
  });

  test("creates 403 error with custom message", () => {
    const err = new ForbiddenError("Access denied");
    expect(err.status).toBe(403);
    expect(err.message).toBe("Access denied");
  });
});

describe("ValidationError", () => {
  test("creates 400 error with default message", () => {
    const err = new ValidationError();
    expect(err.status).toBe(400);
    expect(err.message).toBe("Validation Failed");
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual([]);
  });

  test("creates error with custom message and details", () => {
    const details = [
      { field: "email", message: "Invalid email format" },
      { field: "password", message: "Too short" },
    ];
    const err = new ValidationError("Input validation failed", details);
    expect(err.message).toBe("Input validation failed");
    expect(err.details).toEqual(details);
  });

  test("toJSON includes details", () => {
    const details = [{ field: "email", message: "Required" }];
    const err = new ValidationError("Validation Failed", details);
    expect(err.toJSON()).toEqual({
      error: "Validation Failed",
      code: "VALIDATION_ERROR",
      status: 400,
      details: details,
    });
  });
});
