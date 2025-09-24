require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'map_my_seat_dev'
    },
    migrations: {
      directory: './migrations',
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  testing: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'map_my_seat_test'
    },
    migrations: {
      directory: './migrations',
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: './migrations',
    },
    pool: {
      min: 2,
      max: 10
    }
  },
};