"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || process.env.JWT_SECRET || "secret-dev";

const HOST = process.env.HOST || '0.0.0.0';

const PORT = +process.env.PORT || 3001;

//Automates URI to correct db URI based on whether in testing env or not
function getDatabaseUri() {
  if (process.env.NODE_ENV === "test") {
    return process.env.TEST_DATABASE_URL || "postgresql://localhost/map_my_seat_test";
  }
  return process.env.DATABASE_URL || "postgresql://localhost/map_my_seat";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

// CORS configuration
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

module.exports = {
  SECRET_KEY,
  HOST,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  CORS_ORIGINS,
  target: "node",
};
