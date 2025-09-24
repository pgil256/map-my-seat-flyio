const request = require("supertest");
const app = require("../app");
const Classroom = require("../models/classroom");
const SeatingChart = require("../models/SeatingChart");

describe("Classroom", () => {

  describe("POST /:username", () => {
    it("should create a new classroom", async () => {
      const res = await request(app)
        .post(`/classrooms/${classroom.username}`)
        .send({
          name: "New Classroom",
          capacity: 20,
          location: "Room 102",
        })
        .expect(201);

      expect(res.body.classrooms).toHaveProperty("id");
      expect(res.body.classrooms.name).toBe("New Classroom");
      expect(res.body.classrooms.capacity).toBe(20);
      expect(res.body.classrooms.location).toBe("Room 102");
    });
  });

  describe("GET /:username", () => {
    it("should retrieve a classroom by username", async () => {
      const res = await request(app)
        .get(`/classrooms/${classroom.username}`)
        .expect(200);

      expect(res.body.classrooms).toHaveProperty("id");
      expect(res.body.classrooms.name).toBe(classroom.name);
      expect(res.body.classrooms.capacity).toBe(classroom.number);
      expect(res.body.classrooms.location).toBe(classroom.seatingConfig);
    });
  });

  describe("PATCH /:classroomId", () => {
    it("should update a classroom", async () => {
      const res = await request(app)
        .patch(`/classrooms/${classroom.id}`)
        .send({
          name: "Updated Classroom",
          capacity: 25,
          seatingConfig:null
        })
        .expect(200);

      expect(res.body.classrooms).toHaveProperty("id");
      expect(res.body.classrooms.name).toBe("Updated Classroom");
      expect(res.body.classrooms.number).toBe(25);
      expect(res.body.classrooms.seatingConfig).toBe("null");
    });
  });

  describe("DELETE /:classroomId", () => {
    it("should delete a classroom", async () => {
      const res = await request(app)
        .delete(`/classrooms/${classroom.id}`)
        .expect(200);

      expect(res.body.deleted).toBe(classroom.id);

      const deletedClassroom = await Classroom.get(classroom.id);
      expect(deletedClassroom).toBeUndefined();
    });
  });
});


describe("SeatingCharts", () => {
  describe("POST /:classroomId/seating-charts", () => {
    it("should create a new seating chart", async () => {
      const res = await request(app)
        .post(`/classrooms/${classroom.id}/seating-charts`)
        .send({
          number: 2,
          name:New
          seatingChart:'[]'
        })
        .expect(201);

      expect(res.body.seatingChart).toHavePropery("number");
      expect(res.body.seatingChart).toHavePropery("name");
    });

