const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const SeatingChart = require("./seating_chart.js");
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


describe('SeatingChart', () => {
  describe('createSeatingChart', () => {
    it('should insert a new seating chart', async () => {
      
      const classroomId = 1;
      const number = 1;
      const seatingChart = [[1, 2], [3, 4]];
      const expectedSeatingChart = {
        seatingChartId: 1,
        classroomId,
        number,
        seatingChart,
      };
      db.query({
        rows: [expectedSeatingChart],
      });
      const result = await SeatingChart.createSeatingChart({
        classroomId,
        number,
        seatingChart,
      });
      expect(result).toEqual(expectedSeatingChart);
    }));;
  });

  describe("updateSeatingChart", () => {
    test("updates seating chart successfully", async () => {
      const seatingChartId = 1;
      const data = { number: 2, seatingChart: "new seating chart" };
      const querySql = `UPDATE seating_charts 
                        SET number=$1, seating_chart=$2 
                        WHERE classroom_id=$3 
                        RETURNING seating_chart_id`;
      const values = [data.number, data.seatingChart, seatingChartId];
      db.query({ rows: [{ seating_chart_id: seatingChartId }] });
  
      const result = await updateSeatingChart(seatingChartId, data);

      expect(result).toEqual({ seating_chart_id: seatingChartId });
    });
  });

  const { NotFoundError } = require('path/to/errors');
const db = require('path/to/db');
const { getSeatingChart } = require('path/to/seatingChart');

describe('getSeatingChart', () => {
  it('should return correct seating chart', async () => {
    // Arrange
    const seatingChartId = 1;
    const expectedSeatingChart = {
      seatingChartId: 1,
      classroom_id: 1,
      number: 1,
      seatingChart: '[[1, 2], [3, 4]]',
    };
    db.query{ rows: [SeatingChart] });


    const expectedseatingChart = await getSeatingChart(seatingChartId);

    // Assert
    expect(seatingChart).toEqual([expectedSeatingChart]);

  });

