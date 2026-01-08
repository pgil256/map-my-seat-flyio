const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Classroom {
  // CRUD operations for classrooms

  static async getClassroom(username) {
    const classroom = await db
      .select([
        db.raw('classroom_id AS "classroomId"'),
        db.raw('user_username AS "username"'),
        'name',
        db.raw('seat_alphabetical AS "seatAlphabetical"'),
        db.raw('seat_randomize AS "seatRandomize"'),
        db.raw('seat_male_female AS "seatMaleFemale"'),
        db.raw('seat_high_low AS "seatHighLow"'),
        db.raw('ese_is_priority AS "eseIsPriority"'),
        db.raw('ell_is_priority AS "ellIsPriority"'),
        db.raw('fivezerofour_is_priority AS "fiveZeroFourIsPriority"'),
        db.raw('ebd_is_priority AS "ebdIsPriority"'),
        db.raw('seating_config AS "seatingConfig"')
      ])
      .from('classrooms')
      .where('user_username', username)
      .first();

    if (!classroom) {
      throw new NotFoundError(
        `Classroom configuration for user ${username} does not exist`
      );
    }

    return classroom;
  }

  static async getClassrooms(username) {
    const classrooms = await db
      .select([
        db.raw('classroom_id AS "classroomId"'),
        db.raw('user_username AS "username"'),
        'name',
        db.raw('seat_alphabetical AS "seatAlphabetical"'),
        db.raw('seat_randomize AS "seatRandomize"'),
        db.raw('seat_male_female AS "seatMaleFemale"'),
        db.raw('seat_high_low AS "seatHighLow"'),
        db.raw('ese_is_priority AS "eseIsPriority"'),
        db.raw('ell_is_priority AS "ellIsPriority"'),
        db.raw('fivezerofour_is_priority AS "fiveZeroFourIsPriority"'),
        db.raw('ebd_is_priority AS "ebdIsPriority"'),
        db.raw('seating_config AS "seatingConfig"')
      ])
      .from('classrooms')
      .where('user_username', username);

    return classrooms;
  }

  static async getClassroomById(classroomId) {
    const classroom = await db
      .select([
        db.raw('classroom_id AS "classroomId"'),
        db.raw('user_username AS "username"'),
        'name',
        db.raw('seat_alphabetical AS "seatAlphabetical"'),
        db.raw('seat_randomize AS "seatRandomize"'),
        db.raw('seat_male_female AS "seatMaleFemale"'),
        db.raw('seat_high_low AS "seatHighLow"'),
        db.raw('ese_is_priority AS "eseIsPriority"'),
        db.raw('ell_is_priority AS "ellIsPriority"'),
        db.raw('fivezerofour_is_priority AS "fiveZeroFourIsPriority"'),
        db.raw('ebd_is_priority AS "ebdIsPriority"'),
        db.raw('seating_config AS "seatingConfig"')
      ])
      .from('classrooms')
      .where('classroom_id', classroomId)
      .first();

    if (!classroom) {
      throw new NotFoundError(`Classroom with id ${classroomId} does not exist`);
    }

    return classroom;
  }

  static async createClassroom(username, name = 'My Classroom') {
    const [classroom] = await db('classrooms')
      .insert({
        user_username: username,
        name: name,
        seat_alphabetical: false,
        seat_randomize: false,
        seat_male_female: false,
        seat_high_low: false,
        ese_is_priority: false,
        ell_is_priority: false,
        fivezerofour_is_priority: false,
        ebd_is_priority: false,
        seating_config: JSON.stringify(
          Array.from({ length: 12 }, () => Array(12).fill(null))
        )
      })
      .returning([
        db.raw('classroom_id AS "classroomId"'),
        db.raw('user_username AS "username"'),
        'name',
        db.raw('seat_alphabetical AS "seatAlphabetical"'),
        db.raw('seat_randomize AS "seatRandomize"'),
        db.raw('seat_male_female AS "seatMaleFemale"'),
        db.raw('seat_high_low AS "seatHighLow"'),
        db.raw('ese_is_priority AS "eseIsPriority"'),
        db.raw('ell_is_priority AS "ellIsPriority"'),
        db.raw('fivezerofour_is_priority AS "fiveZeroFourIsPriority"'),
        db.raw('ebd_is_priority AS "ebdIsPriority"'),
        db.raw('seating_config AS "seatingConfig"')
      ]);

    return classroom;
  }
  static async updateClassroom(classroomId, data) {
    // Directly get an object with columns to update as keys and their values.
    const dataToUpdate = sqlForPartialUpdate(
      data,
      {
        name: "name",
        seatAlphabetical: "seat_alphabetical",
        seatRandomize: "seat_randomize",
        seatHighLow: "seat_high_low",
        seatMaleFemale: "seat_male_female",
        eseIsPriority: "ese_is_priority",
        ellIsPriority: "ell_is_priority",
        fiveZeroFourIsPriority: "fivezerofour_is_priority",
        ebdIsPriority: "ebd_is_priority",
        seatingConfig: "seating_config"
      }
    );

    const classroom = await db('classrooms')
      .where('classroom_id', classroomId)
      .update(dataToUpdate)
      .returning([
        db.raw('classroom_id AS "classroomId"'),
        db.raw('user_username AS "username"'),
        'name',
        db.raw('seat_alphabetical AS "seatAlphabetical"'),
        db.raw('seat_randomize AS "seatRandomize"'),
        db.raw('seat_high_low AS "seatHighLow"'),
        db.raw('seat_male_female AS "seatMaleFemale"'),
        db.raw('ese_is_priority AS "eseIsPriority"'),
        db.raw('ell_is_priority AS "ellIsPriority"'),
        db.raw('fivezerofour_is_priority AS "fiveZeroFourIsPriority"'),
        db.raw('ebd_is_priority AS "ebdIsPriority"'),
        db.raw('seating_config AS "seatingConfig"')
      ]);

    if (!classroom || classroom.length === 0) {
      throw new NotFoundError(`Classroom with id of ${classroomId} does not exist`);
    }

    return classroom[0];
  }
  

  static async deleteClassroom(classroomId) {
    const classroom = await db('classrooms')
      .where('classroom_id', classroomId)
      .del()
      .returning(db.raw('classroom_id AS "classroomId"'));

    if (!classroom) {
      throw new NotFoundError(`Classroom with id of ${classroomId} does not exist`);
    }
  }
}

module.exports = Classroom;
