const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  // CRUD operations for User

  static async authenticate(username, password) {
    const user = await db('users')
      .select([
        'username',
        'password',
        'title',
        db.raw('first_name AS "firstName"'),
        db.raw('last_name AS "lastName"'),
        'email',
        db.raw('is_admin AS "isAdmin"')
      ])
      .where('username', username)
      .first();

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        const { password: pwd, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    throw new UnauthorizedError("Invalid username and password combination");
  }

  static async register({ username, password, title, firstName, lastName, email, isAdmin }) {
    const duplicateCheck = await db('users')
      .where('username', username)
      .first();

    if (duplicateCheck) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const [user] = await db('users')
      .insert({
        username,
        password: hashedPassword,
        title,
        first_name: firstName,
        last_name: lastName,
        email,
        is_admin: isAdmin
      })
      .returning([
        'username',
        'title',
        db.raw('first_name AS "firstName"'),
        db.raw('last_name AS "lastName"'),
        'email',
        db.raw('is_admin AS "isAdmin"')
      ]);

    return user;
  }

  static async findAll() {
    const users = await db('users')
      .select([
        'username',
        'title',
        db.raw('first_name AS "firstName"'),
        db.raw('last_name AS "lastName"'),
        'email',
        db.raw('is_admin AS "isAdmin"')
      ])
      .orderBy('username');

    return users;
  }

  static async get(username) {
    const user = await db('users')
      .select([
        'username',
        'title',
        db.raw('first_name AS "firstName"'),
        db.raw('last_name AS "lastName"'),
        'email',
        db.raw('is_admin AS "isAdmin"')
      ])
      .where('username', username)
      .first();

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
  
    const dataToUpdate = sqlForPartialUpdate(
      data,
      {
        firstName: "first_name",
        lastName: "last_name",
      }
    );
  
    const [user] = await db('users')
      .where('username', username)
      .update(dataToUpdate)
      .returning([
        db.raw('first_name AS "firstName"'),
        db.raw('last_name AS "lastName"')
      ]);
  
    if (!user) throw new NotFoundError(`User not found: ${username}`);
  
    return user;
  }
  

  static async remove(username) {
    const [user] = await db('users')
      .where('username', username)
      .del()
      .returning('username');

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}

module.exports = User;
