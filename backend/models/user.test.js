const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const { authenticate } = require('.');

describe('authenticate', () => {
  it('should return a user object if the username and password are valid', async () => {

    const username = 'testuser';
    const password = 'testpassword';
    const dbQuery({
      rows: [{ username, password: '$2b$10$K5JZJ...' }]
    });

    const expectedUser = { username };

  
    const user = await authenticate(username, password, dbQuery);
    expect(user).toEqual(expectedUser);
  });
});


  describe('update', () => {
    it('should update user data', async () => {
      const username = 'testuser';
      const data = {
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };
      const updatedUser = await update(username, data);
      expect(updatedUser.firstName).toEqual(data.firstName);
      expect(updatedUser.lastName).toEqual(data.lastName);
      expect(updatedUser.password).not.toEqual(data.password);
    });
});

const { NotFoundError } = require('../errors');
const db = require('../db');
const { remove } = require('./users');

describe('remove', () => {
  it('removes a user from the database', async () => {
    await remove('testuser');
    const result = await db.query('SELECT * FROM users WHERE username = $1', ['testuser']);
    expect(result.rows.length).toBe(0);
  });
});