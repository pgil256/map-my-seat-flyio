const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  // Delete in correct order due to foreign key constraints
  await db.query("DELETE FROM seating_charts");
  await db.query("DELETE FROM students");
  await db.query("DELETE FROM classrooms");
  await db.query("DELETE FROM periods");
  await db.query("DELETE FROM users");

  // Insert test users
  await db.query(
    `INSERT INTO users(username, password, title, first_name, last_name, email, is_admin)
     VALUES ('u1', $1, 'Mr.', 'U1F', 'U1L', 'u1@email.com', false),
            ('u2', $2, 'Ms.', 'U2F', 'U2L', 'u2@email.com', false)`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );

  // Insert test periods
  await db.query(`
    INSERT INTO periods (user_username, school_year, title, number)
    VALUES ('u1', '2023-2024', 'Math Period 1', 1),
           ('u1', '2023-2024', 'Math Period 2', 2)
  `);

  // Insert test classroom
  await db.query(`
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

  // Insert test students
  await db.query(`
    INSERT INTO students (period_id, name, grade, gender, is_ESE, has_504, is_ELL, is_EBD)
    SELECT period_id, 'Test Student 1', 10, 'M', false, false, false, false
    FROM periods WHERE number = 1 AND user_username = 'u1'
  `);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
