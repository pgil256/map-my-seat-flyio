"use strict";

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const HOST = '0.0.0.0';

const PORT = +process.env.PORT || 8080;

//Automates URI to correct db URI based on whether in testing env or not
function getDatabaseUri() {
  console.log(process.env.NODE_ENV);
  console.log(process.env.DATABASE_URL);
  return process.env.NODE_ENV === "test"
    ? "seating_test"
    : process.env.DATABASE_URL || "map-my-seat-db";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
  SECRET_KEY,
  HOST,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  target: "node",
};
