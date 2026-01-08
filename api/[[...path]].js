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

app.use(cors());
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

// 404 handler
app.use((req, res, next) => {
  return next(new NotFoundError());
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  return res.status(status).json({ error: { message: err.message, status } });
});

module.exports = app;
