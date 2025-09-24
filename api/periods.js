const express = require("express");
const cors = require("cors");
const { authenticateJWT } = require("../backend/middleware/auth");
const periodsRoutes = require("../backend/routes/periods");

const app = express();

app.use(cors({
  origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*',
  credentials: true
}));
app.use(express.json());
app.use(authenticateJWT);

app.use("/api/periods", periodsRoutes);

module.exports = app;