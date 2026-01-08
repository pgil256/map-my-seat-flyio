const bcrypt = require("bcrypt");

const db = require("../db.js");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const { BCRYPT_WORK_FACTOR } = require("../config");

let u1Token;
let u2Token;
let adminToken;

async function commonBeforeAll() {
  // Delete in correct order due to foreign key constraints
  await db.raw("DELETE FROM seating_charts");
  await db.raw("DELETE FROM students");
  await db.raw("DELETE FROM classrooms");
  await db.raw("DELETE FROM periods");
  await db.raw("DELETE FROM users");

  // Insert test users
  const password1 = await bcrypt.hash("password1", BCRYPT_WORK_FACTOR);
  const password2 = await bcrypt.hash("password2", BCRYPT_WORK_FACTOR);
  const adminPassword = await bcrypt.hash("adminpassword", BCRYPT_WORK_FACTOR);
  await db.raw(
    `INSERT INTO users(username, password, title, first_name, last_name, email, is_admin)
     VALUES ('u1', ?, 'Mr.', 'U1F', 'U1L', 'u1@email.com', false),
            ('u2', ?, 'Ms.', 'U2F', 'U2L', 'u2@email.com', false),
            ('admin', ?, 'Dr.', 'Admin', 'User', 'admin@email.com', true)`,
    [password1, password2, adminPassword]
  );

  // Insert test periods
  await db.raw(`
    INSERT INTO periods (user_username, school_year, title, number)
    VALUES ('u1', '2023-2024', 'Math Period 1', 1),
           ('u1', '2023-2024', 'Math Period 2', 2)
  `);

  // Insert test classroom
  await db.raw(`
    INSERT INTO classrooms(
      user_username,
      seat_alphabetical,
      randomize,
      seat_high_low,
      seat_male_female,
      ESE_is_priority,
      ELL_is_priority,
      fivezerofour_is_priority,
      EBD_is_priority,
      seating_config
    )
    VALUES(
      'u1',
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      '[[null,null,"desk"],[null,null,"desk"]]'
    )
  `);

  // Create tokens
  u1Token = createToken({ username: "u1", isAdmin: false });
  u2Token = createToken({ username: "u2", isAdmin: false });
  adminToken = createToken({ username: "admin", isAdmin: true });
}

async function commonBeforeEach() {
  await db.raw("BEGIN");
}

async function commonAfterEach() {
  await db.raw("ROLLBACK");
}

async function commonAfterAll() {
  await db.destroy();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getU1Token: () => u1Token,
  getU2Token: () => u2Token,
  getAdminToken: () => adminToken,
};
