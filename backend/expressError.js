// Custom error classes with standardized error codes

class ExpressError extends Error {
  constructor(message, status, code = "UNKNOWN_ERROR") {
    super();
    this.message = message;
    this.status = status;
    this.code = code;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      status: this.status,
    };
  }
}

class NotFoundError extends ExpressError {
  constructor(message = "Not Found") {
    super(message, 404, "NOT_FOUND");
  }
}

class UnauthorizedError extends ExpressError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

class BadRequestError extends ExpressError {
  constructor(message = "Bad Request") {
    super(message, 400, "BAD_REQUEST");
  }
}

class ForbiddenError extends ExpressError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

class ValidationError extends ExpressError {
  constructor(message = "Validation Failed", details = []) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
    };
  }
}

module.exports = {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
  ValidationError,
};
