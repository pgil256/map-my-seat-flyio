const db = require('../db.js');
const User = require('../models/user');
const Period = require('../models/period')
const classroom = require('../models/classroom');
const { createToken } = require('../helpers/tokens');


async function commonBeforeAll() {
  await db.query('DELETE FROM users');
  await db.query('DELETE FROM companies');

  await Classroom.create({
    classroomId: 1,
    username: 'testuser',
    seatAlphabetical: true,
    seatRandomize: false,
    seatHighLow: true,
    eseIsPriority: true,
    ellIsPriority: false,
    fiveZeroFourIsPriority: true,
    ebdIsPriority: false,
    seatingConfig: 'seating config'
  });
  await User.register({
    username: 'u1',
    firstName: 'U1F',
    title:'Mr.',
    lastName: 'U1L',
    email: 'user1@user.com',
    password: 'password1',
    isAdmin: false,
  });


  const student = await Student.create({
    periodId: 1,
    name: "John Doe",
    grade: 10,
    gender: "male",
    isESE: false,
    has504: true,
    isELL: false,
    isEBD: true,
  });


async function commonBeforeEach() {
  await db.query('BEGIN');
}

async function commonAfterEach() {
  await db.query('ROLLBACK');
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
};