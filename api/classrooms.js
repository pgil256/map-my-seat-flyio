const express = require("express");
const cors = require("cors");
const { authenticateJWT } = require("../backend/middleware/auth");
const classroomsRoutes = require("../backend/routes/classrooms");

const app = express();

app.use(cors({
  origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*',
  credentials: true
}));
app.use(express.json());
app.use(authenticateJWT);

app.use("/api/classrooms", classroomsRoutes);

module.exports = app;