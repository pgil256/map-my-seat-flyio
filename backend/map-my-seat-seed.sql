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

-- Generated demo roster with fictional grades and support settings.
INSERT INTO students (period_id, name, grade, gender, is_ese, has_504, is_ell, is_ebd)
VALUES
  (1, 'Sample Student 01', '69', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 02', '76', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 03', '83', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 04', '90', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 05', '97', 'F', TRUE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 06', '67', 'M', FALSE, FALSE, TRUE, FALSE),
  (1, 'Sample Student 07', '74', 'F', FALSE, TRUE, FALSE, FALSE),
  (1, 'Sample Student 08', '81', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 09', '88', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 10', '95', 'M', TRUE, FALSE, FALSE, TRUE),
  (1, 'Sample Student 11', '65', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 12', '72', 'M', FALSE, FALSE, TRUE, FALSE),
  (1, 'Sample Student 13', '79', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 14', '86', 'M', FALSE, TRUE, FALSE, FALSE),
  (1, 'Sample Student 15', '93', 'F', TRUE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 16', '63', 'M', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 17', '70', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 18', '77', 'M', FALSE, FALSE, TRUE, FALSE),
  (1, 'Sample Student 19', '84', 'F', FALSE, FALSE, FALSE, FALSE),
  (1, 'Sample Student 20', '91', 'M', TRUE, FALSE, FALSE, TRUE),
  (1, 'Sample Student 21', '98', 'F', FALSE, TRUE, FALSE, FALSE);

INSERT INTO classrooms
  (user_username, seat_alphabetical, seat_randomize, seat_high_low, seat_male_female, ese_is_priority, ell_is_priority, fivezerofour_is_priority, ebd_is_priority, seating_config)
VALUES
  ('testuser', FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, '[[null,null,null,null,null,"teacher-desk",null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null],[null,"desk",null,"desk",null,"desk",null,"desk",null,"desk",null,"desk"],[null,null,null,null,null,null,null,null,null,null,null,null]]');

INSERT INTO seating_charts(classroom_id, number, seating_chart)
VALUES(
        1,
        1,
        '[{"id":"5-0","class":"teacher-desk","name":"Demo Teacher"},{"id":"1-2","class":"desk","name":"Sample Student 01"},{"id":"3-2","class":"desk","name":"Sample Student 02"},{"id":"5-2","class":"desk","name":"Sample Student 03"},{"id":"7-2","class":"desk","name":"Sample Student 04"},{"id":"9-2","class":"desk","name":"Sample Student 05"},{"id":"11-2","class":"desk","name":"Sample Student 06"},{"id":"1-4","class":"desk","name":"Sample Student 07"},{"id":"3-4","class":"desk","name":"Sample Student 08"},{"id":"5-4","class":"desk","name":"Sample Student 09"},{"id":"7-4","class":"desk","name":"Sample Student 10"},{"id":"9-4","class":"desk","name":"Sample Student 11"},{"id":"11-4","class":"desk","name":"Sample Student 12"},{"id":"1-6","class":"desk","name":"Sample Student 13"},{"id":"3-6","class":"desk","name":"Sample Student 14"},{"id":"5-6","class":"desk","name":"Sample Student 15"},{"id":"7-6","class":"desk","name":"Sample Student 16"},{"id":"9-6","class":"desk","name":"Sample Student 17"},{"id":"11-6","class":"desk","name":"Sample Student 18"},{"id":"1-8","class":"desk","name":"Sample Student 19"},{"id":"3-8","class":"desk","name":"Sample Student 20"},{"id":"5-8","class":"desk","name":"Sample Student 21"}]'
);