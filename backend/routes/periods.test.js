const request = require('supertest');
const app = require('../app');
const Period = require('../models/period');
const Student = require('../models/student');

  describe('POST /periods', () => {
    it('should create a new period', async () => {
      const res = await request(app)
        .post('/periods')
        .send({
          name: 'New Period',
          title: 'English',
          schoolYear: '2022-2023',
        })
        .expect(201);

      expect(res.body.periods).toHaveProperty('name');
      expect(res.body.periods).toHaveProperty('title');
      expect(res.body.periods).toHaveProperty('schoolYear');
 
    });
  });

  describe('GET /periods/:username', () => {
    it('should retrieve all periods for a user', async () => {
      const res = await request(app)
        .get(`/periods/${process.env.TEST_USERNAME}`)
        .expect(200);

      expect(res.body.periods).toHaveLength(1);
      expect(res.body.periods[0]).toHaveProperty('id', periodId);
    });
  });

  describe('GET /periods/:periodId', () => {
    it('should retrieve a period by ID', async () => {
      const res = await request(app)
        .get(`/periods/${periodId}`)
        .expect(200);

      expect(res.body.periods).toHaveProperty('id', periodId);
    });
  });

  describe('PATCH /periods/:periodId', () => {
    it('should update a period', async () => {
      const res = await request(app)
        .patch(`/periods/${periodId}`)
        .send({
          name: 'Updated Period',
        })
        .expect(200);

      expect(res.body.periods).toHaveProperty('id', periodId);
      expect(res.body.periods.name).toBe('Updated Period');
    });

    it('should return a 400 error for bad data, async () => {
      const res = await request(app)
        .patch(`/periods/${periodId}`)
        .send({
           number: 'asdkj'
        })
        .expect(400);

      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveLength(1);
    });
  });

  describe('DELETE /periods/:periodId', () => {
    it('should delete a period', async () => {
      const res = await request(app)
        .delete(`/periods/${periodId}`)
        .expect(200);

      expect(res.body).toHaveProperty('deleted', periodId);
    });
  });

  describe('POST /periods/:periodId/students', () => {
    it('should create a new student', async () => {
      const res = await request(app)
        .post(`/periods/${periodId}/students`)
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
        })
        .expect(201);

      expect(res.body.students).toHaveProperty('id');
      expect(res.body.students.firstName).toBe('Jane');
    });

    it('should return a 400 error if invalid data is sent', async () => {
      const res = await request(app)
        .post(`/periods/${periodId}/students`)
        .send({
          firstName: null,
          lastName: 'Student',
        })
        .expect(400);

      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveLength(1);
    });
  });

