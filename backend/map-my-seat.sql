\echo 'Delete and recreate map-my-seat db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE map-my-seat-db;
CREATE DATABASE map-my-seat-db;
\connect map-my-seat-db

\i map-my-seat-schema.sql
\i map-my-seat-seed.sql

\echo 'Delete and recreate map-my-seat_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE map-my-seat_test;
CREATE DATABASE map-my-seat_test;
\connect map-my-seat_test

\i map-my-seat-schema.sql

