const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Student {
  // CRUD operations for students

  static async createStudent(data) {
    const [student] = await db('students')
      .insert({
        period_id: data.periodId,
        name: data.name,
        grade: data.grade,
        gender: data.gender,
        is_ese: data.isESE,     
        has_504: data.has504,
        is_ell: data.isELL,     
        is_ebd: data.isEBD      
      })
      .returning([
        db.raw('student_id AS "studentId"'),
        db.raw('period_id AS "periodId"'),
        'name',
        'grade',
        'gender',
        db.raw('is_ese AS "isESE"'),    
        db.raw('has_504 AS "has504"'),
        db.raw('is_ell AS "isELL"'),    
        db.raw('is_ebd AS "isEBD"')     
      ]);

    return student;
  }

  static async updateStudent(studentId, data) {
    const dataToUpdate = sqlForPartialUpdate(
      data,
      {
        studentId: "student_id",
        name: "name",
        grade: "grade",
        gender: "gender",
        isESE: "is_ese",       
        has504: "has_504",
        isELL: "is_ell",       
        isEBD: "is_ebd"        
      }
    );
  
    const [student] = await db('students')
      .where('student_id', studentId)
      .update(dataToUpdate)
      .returning([
        db.raw('student_id AS "studentId"'),
        'name',
        'grade',
        'gender',
        db.raw('is_ese AS "isESE"'),    
        db.raw('has_504 AS "has504"'),
        db.raw('is_ell AS "isELL"'),    
        db.raw('is_ebd AS "isEBD"')     
      ]);
  
    if (!student) {
      throw new NotFoundError(`No student with id of ${studentId}`);
    }
  
    return student;
  }
  

  static async deleteStudent(studentId) {
    const [student] = await db('students')
      .where('student_id', studentId)
      .del()
      .returning('name');

    if (!student) {
      throw new NotFoundError(`No student with id of ${studentId}`);
    }
  }
}

module.exports = Student;
