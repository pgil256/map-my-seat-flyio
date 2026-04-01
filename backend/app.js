"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const morgan = require("morgan");

const { authenticateJWT } = require("./middleware/auth");
const { NotFoundError } = require("./expressError");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const classroomsRoutes = require("./routes/classrooms");
const periodsRoutes = require("./routes/periods");
const constraintsRoutes = require("./routes/constraints");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("tiny"));
}

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: "Too many attempts, please try again later", code: "RATE_LIMITED", status: 429 },
});

app.use(authenticateJWT);

app.use("/auth", authLimiter, authRoutes);
app.use("/users", usersRoutes);
app.use("/classrooms", classroomsRoutes);
app.use("/periods", periodsRoutes);
app.use("/constraints", constraintsRoutes);

// Serve frontend in production
const FRONTEND_DIST_DIR = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(FRONTEND_DIST_DIR));

app.get("*", (req, res, next) => {
  // Only serve index.html for non-API requests
  if (req.path.startsWith("/auth") || req.path.startsWith("/users") ||
      req.path.startsWith("/classrooms") || req.path.startsWith("/periods") ||
      req.path.startsWith("/constraints")) {
    return next(new NotFoundError());
  }
  res.sendFile(path.join(FRONTEND_DIST_DIR, "index.html"));
});

// 404 handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

// Error handler
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);

  const status = err.status || 500;
  const response = err.toJSON ? err.toJSON() : {
    error: err.message || "Internal Server Error",
    code: "INTERNAL_ERROR",
    status: status,
  };

  return res.status(status).json(response);
});

module.exports = app;
