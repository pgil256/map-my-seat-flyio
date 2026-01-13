const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Period {
  // CRUD operations for periods

  static async createPeriod({ username, schoolYear, title, number }) {
    const duplicateCheck = await db('periods')
      .where('user_username', username)
      .andWhere('number', number)
      .first();

    if (duplicateCheck) {
      throw new BadRequestError(
        `Duplicate period: Year of ${schoolYear} Period ${number}: ${title}`
      );
    }

    const [period] = await db('periods')
      .insert({
        user_username: username,
        school_year: schoolYear,
        title: title,
        number: number
      })
      .returning([
        db.raw('period_id AS "periodId"'),
        db.raw('user_username AS "username"'),
        db.raw('school_year AS "schoolYear"'),
        'title',
        'number'
      ]);

    return period;
  }

  static async getPeriods(username) {
    const periods = await db('periods')
      .select([
        db.raw('period_id AS "periodId"'),
        db.raw('user_username AS "username"'),
        db.raw('school_year AS "schoolYear"'),
        'title',
        'number'
      ])
      .where('user_username', username);

    if (periods.length === 0) {
      throw new NotFoundError(`No periods yet`);
    }

    return periods;
  }

  static async getPeriod(periodId) {
    const period = await db('periods')
      .select([
        db.raw('period_id AS "periodId"'),
        db.raw('user_username AS "username"'),
        db.raw('school_year AS "schoolYear"'),
        'title',
        'number'
      ])
      .where('period_id', periodId)
      .first();

    if (!period) {
      throw new NotFoundError(`No period: ${periodId}`);
    }

    // Also get students for this period
    const students = await db('students as s')
      .select([
        db.raw('s.student_id AS "studentId"'),
        db.raw('s.period_id AS "periodId"'),
        's.name',
        's.grade',
        's.gender',
        db.raw('s.is_ESE AS "isESE"'),
        db.raw('s.has_504 AS "has504"'),
        db.raw('s.is_ELL AS "isELL"'),
        db.raw('s.is_EBD AS "isEBD"')
      ])
      .where('s.period_id', periodId)
      .orderBy('s.name');

    return { ...period, students };
  }

  static async updatePeriod(periodId, data) {
    const dataToUpdate = sqlForPartialUpdate(
      data,
      {
        periodId: "period_id",
        schoolYear: "school_year",
        title: "title",
        number: "number"
      }
    );
  
    const period = await db('periods')
      .where('period_id', periodId)
      .update(dataToUpdate)
      .returning([
        db.raw('period_id AS "periodId"'),
        db.raw('school_year AS "schoolYear"'),
        'title',
        'number'
      ]);
  
    if (!period || period.length === 0) {
      throw new NotFoundError(`No period: Period ${data.number}, ${data.title}`);
    }
  
    return period[0];
  }
  

  static async deletePeriod(periodId) {
    const period = await db('periods')
      .where('period_id', periodId)
      .del()
      .returning(db.raw('period_id AS "periodId"'));

    if (!period) {
      throw new NotFoundError(`No period: ${periodId}`);
    }
  }
}

module.exports = Period;
