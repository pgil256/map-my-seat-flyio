CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  email TEXT NOT NULL CHECK (position('@' IN email) > 1),
  title TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE periods (
  period_id SERIAL PRIMARY KEY,
  user_username VARCHAR(25) NOT NULL 
    REFERENCES users ON DELETE CASCADE,
  school_year VARCHAR(15) NOT NULL,
  title VARCHAR(50),
  number INTEGER
);

CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  period_id INTEGER NOT NULL 
    REFERENCES periods ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  grade INTEGER,
  gender VARCHAR,
  is_ese BOOLEAN,
  has_504 BOOLEAN,
  is_ell BOOLEAN,
  is_ebd BOOLEAN
);

CREATE TABLE classrooms (
  classroom_id SERIAL PRIMARY KEY,
  user_username VARCHAR(25) NOT NULL 
    REFERENCES users ON DELETE CASCADE,
  seat_alphabetical BOOLEAN,
  seat_randomize BOOLEAN,
  seat_high_low BOOLEAN,
  seat_male_female BOOLEAN,
  ese_is_priority BOOLEAN,
  ell_is_priority BOOLEAN,
  fivezerofour_is_priority BOOLEAN,
  ebd_is_priority BOOLEAN,
  seating_config JSON
);

CREATE TABLE seating_charts (
  seating_chart_id SERIAL PRIMARY KEY,
  classroom_id INTEGER NOT NULL 
    REFERENCES classrooms ON DELETE CASCADE,
  number INTEGER,
  seating_chart JSON
);
