INSERT INTO users
  (username, password, email, title, first_name, last_name, is_admin)
VALUES
  ('testuser',
   '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
   'pat@patrick.com',
   'Mr.',
   'Test',
   'User',
   FALSE),

  ('testadmin',
   '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
   'testadmin@admin.com',
   'Mr.',
   'Test',
   'Admin',
   TRUE);

INSERT INTO periods (user_username, school_year, title, number)
VALUES
  ('testuser',
   '2022-2023',
   'Advanced Mathematics',
   1);

INSERT INTO students (period_id, name, grade, gender, is_ese, has_504, is_ell, is_ebd)
VALUES
  (1, 'Alderman, Blaison', '82', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Blockom, Anthony', '75', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Brenner, Jamisyn', '71', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Comolyn, Kevin', '43', 'M', TRUE, FALSE, FALSE, FALSE),
  (1, 'Consta, Isabella', '52', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Compano, Carter', '55', 'M', TRUE, FALSE, FALSE, FALSE),
  (1, 'Daven, Leiam', '11', 'M', FALSE, FALSE, FALSE, TRUE),
  (1, 'Donahue, Rashaun', '102', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Famala, Ryder S', '81', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Goh Ramirez, Beatriz', '90', 'M', FALSE, FALSE, TRUE, FALSE),
  (1, 'Hamlin, Ella Margaret', '50', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Imbala-Fernandez, Jocelyn', '90', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Plato, Hailey Jade', '85', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Phang, Joseph Dong', '87', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Quincy, Giavana Hope', '71', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Robinson, Thomas William', '98', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Savannah-Cintago, Andrea', '50', 'F', FALSE, FALSE, TRUE, FALSE),
  (1, 'Stanley, Reighna', '77', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Telhen-Lumando, Brissa', '48', 'F', FALSE, FALSE, TRUE, FALSE),
  (1, 'Timhault, Sharon Elizabeth', '81', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Wilgun, Delaney', '65', 'F', FALSE, TRUE, FALSE, FALSE);

INSERT INTO classrooms
  (user_username, seat_alphabetical, seat_randomize, seat_high_low, seat_male_female, ese_is_priority, ell_is_priority, fivezerofour_is_priority, ebd_is_priority, seating_config)
VALUES
  ('testuser', FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, '[[null,null,null,null,null,"teacher-desk",null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null]]');

INSERT INTO seating_charts(classroom_id, number, seating_chart)
VALUES(
        1,
        1,
        '[{"id": "5-0","class":"teacher-desk","name":"Mr. Gilhooley"},{"id":"1-2","class":"desk","name":"Phang, Joseph Dong"},{"id":"3-2","class":"desk","name":"Hamlin, Ella Margaret"},{"id":"5-2","class":"desk","name":"Robinson, Thomas William"},{"id":"7-2","class":"desk","name":"Goh Ramirez, Beatriz"},{"id":"9-2","class":"desk","name":"Tetrault, Sharon Elizabeth"},{"id":"11-2","class":"desk","name":"Quincy, Giavana Hope"},{"id":"1-4","class":"desk","name":"Donahue, Rashaun"},{"id":"3-4","class":"desk","name":"Consta, Isabella"},{"id":"5-4","class":"desk","name":"Comolyn, Kevin"},{"id":"7-4","class":"desk","name":"Famala, Ryder S"},{"id":"9-4","class":"desk","name":"Stanley, Reighna"},{"id":"11-4","class":"desk","name":"Compano, Carter"},{"id":"1-6","class":"desk","name":"Savannah-Cintago, Andrea"},{"id":"3-6","class":"desk","name":"Imbala-Fernandez, Jocelyn"},{"id":"5-6","class":"desk","name":"Telhen-Lumando, Brissa"},{"id":"7-6","class":"desk","name":"Blockom, Anthony"},{"id":"9-6","class":"desk","name":"Wilgun, Delaney"},{"id":"11-6","class":"desk","name":"Daven, Leiam"},{"id":"1-8","class":"desk","name":"Alderman, Blaison"},{"id":"3-8","class":"desk","name":"Brenner, Jamisyn"},{"id":"5-8","class":"desk","name":"Plato, Hailey Jade"}]'
);