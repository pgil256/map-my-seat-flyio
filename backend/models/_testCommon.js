const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  await db.query("DELETE FROM classrooms");
  await db.query("DELETE FROM periods");
  await db.query("DELETE FROM seating_charts");
  await db.query("DELETE FROM students");
  await db.query("DELETE FROM users");

  await db.query(`
    INSERT INTO classrooms(user_username,
        seat_alphabetical,
        randomize, 
        seat_high_low, 
        seat_male_female, 
        ESE_is_priority,
        ELL_is_priority,
        fivezerofour_is_priority, 
        EBD_is_priority, 
        seating_config
        )
        VALUES(24,
            'user1',
            'FALSE',
            'TRUE',
            'FALSE',
            'FALSE',
            'TRUE',
            'FALSE',
            'FALSE',
            'FALSE',
            '[[null,null,null,null,null,"teacher-desk",null,null,null,null,null, null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null]]'
            )`);

  await db.query(`
  INSERT INTO periods (user_username,school_year, title, number)
             ('user1',
             '2022-2023',
             'Advanced Mathematics',
              1)`);
  await db.query(`
  INSERT INTO students (period_id, 
    name, 
    grade, 
    gender, 
    is_ESE, 
    has_504, 
    is_ELL, 
    is_EBD)
  VALUES(1, 'Alderman, Blaison', '82', 'M', 'FALSE', 'FALSE', 'FALSE', 'FALSE')`);

  await db.query(`INSERT INTO seating_charts(classroom_id, number, seating_chart)
    24,
    1,
   '[{"id": "5-0","class":"teacher-desk","name":"Mr. Gilhooley"},{"id":"1-2","class":"desk","name":"Phang, Joseph Dong"},{"id":"3-2","class":"desk","name":"Hamlin, Ella Margaret"},{"id":"5-2","class":"desk","name":"Robinson, Thomas William"},{"id":"7-2","class":"desk","name":"Goh Ramirez, Beatriz"},{"id":"9-2","class":"desk","name":"Tetrault, Sharon Elizabeth"},{"id":"11-2","class":"desk","name":"Quincy, Giavana Hope"},{"id":"1-4","class":"desk","name":"Donahue, Rashaun"},{"id":"3-4","class":"desk","name":"Consta, Isabella"},{"id":"5-4","class":"desk","name":"Comolyn, Kevin"},{"id":"7-4","class":"desk","name":"Famala, Ryder S"},{"id":"9-4","class":"desk","name":"Stanley, Reighna"},{"id":"11-4","class":"desk","name":"Compano, Carter"},{"id":"1-6","class":"desk","name":"Savannah-Cintago, Andrea"},{"id":"3-6","class":"desk","name":"Imbala-Fernandez, Jocelyn"},{"id":"5-6","class":"desk","name":"Telhen-Lumando, Brissa"},{"id":"7-6","class":"desk","name":"Blockom, Anthony"},{"id":"9-6","class":"desk","name":"Wilgun, Delaney"},{"id":"11-6","class":"desk","name":"Daven, Leiam"},{"id":"1-8","class":"desk","name":"Alderman, Blaison"},{"id":"3-8","class":"desk","name":"Brenner, Jamisyn"},{"id":"5-8","class":"desk","name":"Plato, Hailey Jade"}]'
`);

  await db.query(
    `
        INSERT INTO users(username,
                          password,
                          title,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'Mr.', 'U1F', 'U1L', 'u1@email.com'),
        RETURNING username`,
    [await bcrypt.hash("password1", BCRYPT_WORK_FACTOR)]
  );
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
