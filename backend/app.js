"use strict";
// require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { authenticateJWT } = require("./middleware/auth");
const { NotFoundError } = require("./expressError");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const classroomsRoutes = require("./routes/classrooms");
const periodsRoutes = require("./routes/periods");
const path = require('path');
const morgan = require("morgan");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);
app.set('etag', false)

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/classrooms", classroomsRoutes);
app.use("/periods", periodsRoutes);


// Point to the frontend's built directory
const FRONTEND_DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');

// Serve static files from the dist directory of frontend
app.use(express.static(FRONTEND_DIST_DIR));

// All routes send the index.html from frontend's dist directory
app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST_DIR, 'index.html'));
});

app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

//404 Error handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

//Generic error handler
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});



module.exports = app;
