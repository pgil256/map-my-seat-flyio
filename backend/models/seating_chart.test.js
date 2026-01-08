const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const SeatingChart = require("./seating_chart.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("SeatingChart", () => {
  describe("createSeatingChart", () => {
    it("should create a new seating chart", async () => {
      // First we need to get a valid classroom_id from test data
      const classroomResult = await db.query(
        `SELECT classroom_id FROM classrooms LIMIT 1`
      );

      if (classroomResult.rows.length === 0) {
        // Skip if no test classroom exists
        return;
      }

      const classroomId = classroomResult.rows[0].classroom_id;
      const arrangement = [{ studentId: 1, row: 0, col: 0 }];

      const seatingChart = await SeatingChart.createSeatingChart({
        classroomId,
        number: 99,
        arrangement,
      });

      expect(seatingChart).toHaveProperty("seatingChartId");
      expect(seatingChart.classroomId).toBe(classroomId);
      expect(seatingChart.number).toBe(99);
    });
  });

  describe("getSeatingCharts", () => {
    it("returns all seating charts for a classroom", async () => {
      const classroomResult = await db.query(
        `SELECT classroom_id FROM classrooms LIMIT 1`
      );

      if (classroomResult.rows.length === 0) {
        return;
      }

      const classroomId = classroomResult.rows[0].classroom_id;
      const charts = await SeatingChart.getSeatingCharts(classroomId);

      expect(Array.isArray(charts)).toBe(true);
    });
  });
});
