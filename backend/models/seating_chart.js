const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class SeatingChart {
  // CRUD operations for seating charts

  static async createSeatingChart({ classroomId, number, seatingChart }) {
    const result = await db('seating_charts')
      .insert({
        classroom_id: classroomId,
        number: number,
        seating_chart: seatingChart
      })
      .returning([
        db.raw('seating_chart_id AS "seatingChartId"'),
        db.raw('classroom_id AS "classroomId"'),
        'number',
        db.raw('seating_chart AS "seatingChart"')
      ]);

    return result;
  }

  static async getSeatingCharts(classroomId) {
    const seatingCharts = await db('seating_charts')
      .select([
        db.raw('seating_chart_id AS "seatingChartId"'),
        db.raw('classroom_id AS "classroomId"'),
        'number',
        db.raw('seating_chart AS "seatingChart"')
      ])
      .where('classroom_id', classroomId);

    if (seatingCharts.length === 0) {
      throw new NotFoundError(
        `Seating charts for class with Id of ${classroomId} do not exist`
      );
    }

    return seatingCharts;
  }

  static async getSeatingChart(seatingChartId) {
    const seatingChart = await db('seating_charts')
      .select([
        db.raw('seating_chart_id AS "seatingChartId"'),
        db.raw('classroom_id AS "classroomId"'),
        'number',
        db.raw('seating_chart AS "seatingChart"')
      ])
      .where('seating_chart_id', seatingChartId)
      .first();

    if (!seatingChart) {
      throw new NotFoundError(
        `Seating chart with id of ${seatingChartId} does not exist`
      );
    }

    return seatingChart;
  }

  static async updateSeatingChart(seatingChartId, data) {
    const {
      setCols,
      values
    } = sqlForPartialUpdate(data, {
      number: "number",
      seatingChart: "seating_chart"
    });

    const [seatingChart] = await db('seating_charts')
      .where('seating_chart_id', seatingChartId)
      .update(setCols, values)
      .returning([
        db.raw('seating_chart_id AS "seatingChartId"')
      ]);

    if (!seatingChart) {
      throw new NotFoundError(
        `Seating chart with id of ${seatingChartId} does not exist`
      );
    }

    return seatingChart;
  }

  static async deleteSeatingChart(seatingChartId) {
    const [seatingChart] = await db('seating_charts')
      .where('seating_chart_id', seatingChartId)
      .del()
      .returning([
        db.raw('seating_chart_id AS "seatingChartId"')
      ]);

    if (!seatingChart) {
      throw new NotFoundError(
        `Seating chart with id of ${seatingChartId} does not exist`
      );
    }
  }
}

module.exports = SeatingChart;
