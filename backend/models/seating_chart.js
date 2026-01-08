const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class SeatingChart {
  // CRUD operations for seating charts

  static async createSeatingChart({ classroomId, periodId, number, label, seatingChart }) {
    const [result] = await db('seating_charts')
      .insert({
        classroom_id: classroomId,
        period_id: periodId,
        number: number,
        label: label || null,
        seating_chart: seatingChart
      })
      .returning([
        db.raw('seating_chart_id AS "seatingChartId"'),
        db.raw('classroom_id AS "classroomId"'),
        db.raw('period_id AS "periodId"'),
        'number',
        'label',
        db.raw('seating_chart AS "seatingChart"'),
        db.raw('created_at AS "createdAt"')
      ]);

    return result;
  }

  static async getSeatingCharts(classroomId) {
    const seatingCharts = await db('seating_charts')
      .select([
        db.raw('seating_chart_id AS "seatingChartId"'),
        db.raw('classroom_id AS "classroomId"'),
        db.raw('period_id AS "periodId"'),
        'number',
        'label',
        db.raw('seating_chart AS "seatingChart"'),
        db.raw('created_at AS "createdAt"')
      ])
      .where('classroom_id', classroomId)
      .orderBy('created_at', 'desc');

    return seatingCharts;
  }

  static async getSeatingChartsByPeriod(periodId) {
    const seatingCharts = await db('seating_charts')
      .select([
        db.raw('seating_chart_id AS "seatingChartId"'),
        db.raw('classroom_id AS "classroomId"'),
        db.raw('period_id AS "periodId"'),
        'number',
        'label',
        db.raw('seating_chart AS "seatingChart"'),
        db.raw('created_at AS "createdAt"')
      ])
      .where('period_id', periodId)
      .orderBy('created_at', 'desc');

    return seatingCharts;
  }

  static async getSeatingChart(seatingChartId) {
    const seatingChart = await db('seating_charts')
      .select([
        db.raw('seating_chart_id AS "seatingChartId"'),
        db.raw('classroom_id AS "classroomId"'),
        db.raw('period_id AS "periodId"'),
        'number',
        'label',
        db.raw('seating_chart AS "seatingChart"'),
        db.raw('created_at AS "createdAt"')
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

  static async duplicateSeatingChart(seatingChartId, newLabel) {
    const original = await this.getSeatingChart(seatingChartId);

    const [duplicate] = await db('seating_charts')
      .insert({
        classroom_id: original.classroomId,
        period_id: original.periodId,
        number: original.number,
        label: newLabel || `Copy of ${original.label || 'Chart'}`,
        seating_chart: original.seatingChart
      })
      .returning([
        db.raw('seating_chart_id AS "seatingChartId"'),
        db.raw('classroom_id AS "classroomId"'),
        db.raw('period_id AS "periodId"'),
        'number',
        'label',
        db.raw('seating_chart AS "seatingChart"'),
        db.raw('created_at AS "createdAt"')
      ]);

    return duplicate;
  }

  static async updateSeatingChart(seatingChartId, data) {
    const {
      setCols,
      values
    } = sqlForPartialUpdate(data, {
      number: "number",
      label: "label",
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
