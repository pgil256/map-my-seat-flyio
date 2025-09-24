const request = require('supertest');
const app = require('../app');
const db = require('../db');
const User = require('../models/user')

describe('User Endpoints', () => {
  let adminToken;

  beforeAll(async () => {
    // Log in as admin and get token
    const res = await request(app)
      .post('/login')
      .send({
        username: 'admin',
        password: 'adminpassword'
      })
    adminToken = res.body.token;
  });

  describe('POST /users', () => {
    test('Admin can create a new user', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'newuser',
          password: 'password',
          email: 'newuser@example.com',
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);
      expect(res.body.user.username).toBe('newuser');
      expect(res.body.token).toBeTruthy();
    });
  });

  describe('GET /users', () => {
    test('Admin can get all users', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.users.length).toBeGreaterThan(1);
    });
  });

  describe('GET /users/:username', () => {
    test('Admin can get an individual user', async () => {
      const res = await request(app)
        .get('/users/newuser')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.username).toBe('newuser');
    });
  });
});
