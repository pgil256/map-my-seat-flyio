const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class StudentConstraint {
  /**
   * Create a constraint between two students.
   * @param {number} studentId1 - First student ID
   * @param {number} studentId2 - Second student ID
   * @param {string} constraintType - 'separate' or 'pair'
   */
  static async createConstraint(studentId1, studentId2, constraintType) {
    // Ensure consistent ordering to prevent duplicates
    const [id1, id2] = studentId1 < studentId2
      ? [studentId1, studentId2]
      : [studentId2, studentId1];

    // Check for existing constraint
    const existing = await db('student_constraints')
      .where({ student_id_1: id1, student_id_2: id2 })
      .first();

    if (existing) {
      throw new BadRequestError('Constraint already exists between these students');
    }

    const [constraint] = await db('student_constraints')
      .insert({
        student_id_1: id1,
        student_id_2: id2,
        constraint_type: constraintType
      })
      .returning([
        db.raw('constraint_id AS "constraintId"'),
        db.raw('student_id_1 AS "studentId1"'),
        db.raw('student_id_2 AS "studentId2"'),
        db.raw('constraint_type AS "constraintType"'),
        db.raw('created_at AS "createdAt"')
      ]);

    return constraint;
  }

  /**
   * Get all constraints for students in a period.
   * @param {number} periodId - Period ID
   */
  static async getConstraintsByPeriod(periodId) {
    const constraints = await db('student_constraints as sc')
      .join('students as s1', 'sc.student_id_1', 's1.student_id')
      .join('students as s2', 'sc.student_id_2', 's2.student_id')
      .where('s1.period_id', periodId)
      .select([
        db.raw('sc.constraint_id AS "constraintId"'),
        db.raw('sc.student_id_1 AS "studentId1"'),
        db.raw('s1.name AS "studentName1"'),
        db.raw('sc.student_id_2 AS "studentId2"'),
        db.raw('s2.name AS "studentName2"'),
        db.raw('sc.constraint_type AS "constraintType"'),
        db.raw('sc.created_at AS "createdAt"')
      ]);

    return constraints;
  }

  /**
   * Get constraints for a specific student.
   * @param {number} studentId - Student ID
   */
  static async getConstraintsForStudent(studentId) {
    const constraints = await db('student_constraints')
      .where('student_id_1', studentId)
      .orWhere('student_id_2', studentId)
      .select([
        db.raw('constraint_id AS "constraintId"'),
        db.raw('student_id_1 AS "studentId1"'),
        db.raw('student_id_2 AS "studentId2"'),
        db.raw('constraint_type AS "constraintType"')
      ]);

    return constraints;
  }

  /**
   * Update constraint type.
   * @param {number} constraintId - Constraint ID
   * @param {string} constraintType - New type ('separate' or 'pair')
   */
  static async updateConstraint(constraintId, constraintType) {
    const [constraint] = await db('student_constraints')
      .where('constraint_id', constraintId)
      .update({ constraint_type: constraintType })
      .returning([
        db.raw('constraint_id AS "constraintId"'),
        db.raw('constraint_type AS "constraintType"')
      ]);

    if (!constraint) {
      throw new NotFoundError(`Constraint ${constraintId} not found`);
    }

    return constraint;
  }

  /**
   * Delete a constraint.
   * @param {number} constraintId - Constraint ID
   */
  static async deleteConstraint(constraintId) {
    const result = await db('student_constraints')
      .where('constraint_id', constraintId)
      .del();

    if (result === 0) {
      throw new NotFoundError(`Constraint ${constraintId} not found`);
    }
  }
}

module.exports = StudentConstraint;
