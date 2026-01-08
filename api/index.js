const express = require("express");
const cors = require("cors");
const { authenticateJWT } = require("../backend/middleware/auth");
const { NotFoundError } = require("../backend/expressError");

// Import routes
const authRoutes = require("../backend/routes/auth");
const usersRoutes = require("../backend/routes/users");
const classroomsRoutes = require("../backend/routes/classrooms");
const periodsRoutes = require("../backend/routes/periods");
const constraintsRoutes = require("../backend/routes/constraints");

const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(authenticateJWT);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/classrooms", classroomsRoutes);
app.use("/api/periods", periodsRoutes);
app.use("/api/constraints", constraintsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 404 Error handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

// Generic error handler
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;