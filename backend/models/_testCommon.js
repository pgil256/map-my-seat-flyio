const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  // Delete in correct order due to foreign key constraints
  await db.raw("DELETE FROM student_constraints");
  await db.raw("DELETE FROM seating_charts");
  await db.raw("DELETE FROM students");
  await db.raw("DELETE FROM classrooms");
  await db.raw("DELETE FROM periods");
  await db.raw("DELETE FROM users");

  // Insert test users
  const password1 = await bcrypt.hash("password1", BCRYPT_WORK_FACTOR);
  const password2 = await bcrypt.hash("password2", BCRYPT_WORK_FACTOR);
  await db.raw(
    `INSERT INTO users(username, password, title, first_name, last_name, email, is_admin)
     VALUES ('u1', ?, 'Mr.', 'U1F', 'U1L', 'u1@email.com', false),
            ('u2', ?, 'Ms.', 'U2F', 'U2L', 'u2@email.com', false)`,
    [password1, password2]
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
      seat_randomize,
      seat_high_low,
      seat_male_female,
      ese_is_priority,
      ell_is_priority,
      fivezerofour_is_priority,
      ebd_is_priority,
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

  // Insert test students
  await db.raw(`
    INSERT INTO students (period_id, name, grade, gender, is_ESE, has_504, is_ELL, is_EBD)
    SELECT period_id, 'Test Student 1', 10, 'M', false, false, false, false
    FROM periods WHERE number = 1 AND user_username = 'u1'
  `);
}

async function commonBeforeEach() {
  await db.raw("BEGIN");
}

async function commonAfterEach() {
  await db.raw("ROLLBACK");
}

async function commonAfterAll() {
  // db.destroy() is handled by jest.globalTeardown.js
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
