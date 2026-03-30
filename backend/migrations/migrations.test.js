"use strict";

const knex = require("knex");
const knexConfig = require("../knexfile");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

/**
 * Custom migration source that excludes test files from the migrations
 * directory, preventing Knex from treating them as migration files.
 */
class FilteredMigrationSource {
  constructor(migrationDir) {
    this.migrationDir = migrationDir;
  }

  getMigrations() {
    const files = fs
      .readdirSync(this.migrationDir)
      .filter((f) => f.endsWith(".js") && !f.includes(".test."))
      .sort();
    return Promise.resolve(files);
  }

  getMigrationName(migration) {
    return migration;
  }

  getMigration(migration) {
    return require(path.join(this.migrationDir, migration));
  }
}

let db;
const migrationDir = path.resolve(__dirname);
const migrationConfig = {
  migrationSource: new FilteredMigrationSource(migrationDir),
};

beforeAll(async () => {
  const config = {
    ...knexConfig.test,
    migrations: migrationConfig,
  };
  db = knex(config);
});

afterAll(async () => {
  // Restore schema to latest for other test suites
  await db.migrate.latest();
  await db.destroy();
});

// Each migration operation can be slow on CI
jest.setTimeout(30000);

describe("Knex migrations", () => {
  // Ensure we start from a clean slate
  beforeEach(async () => {
    // Drop all known tables manually to avoid issues with knex_migrations
    // tracking being out of sync with actual schema
    await db.raw(`
      DROP TABLE IF EXISTS student_constraints CASCADE;
      DROP TABLE IF EXISTS seating_charts CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
      DROP TABLE IF EXISTS classrooms CASCADE;
      DROP TABLE IF EXISTS periods CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS knex_migrations CASCADE;
      DROP TABLE IF EXISTS knex_migrations_lock CASCADE;
    `);
  });

  test("all migrations run up on a clean DB", async () => {
    const [batch, log] = await db.migrate.latest();
    expect(batch).toBeGreaterThan(0);
    expect(log.length).toBeGreaterThan(0);
  });

  test("all migrations roll back", async () => {
    await db.migrate.latest();
    const [batch, log] = await db.migrate.rollback(undefined, true);
    expect(log.length).toBeGreaterThan(0);
  });

  test("idempotent up-down-up cycle", async () => {
    const [batch1] = await db.migrate.latest();
    expect(batch1).toBeGreaterThan(0);

    await db.migrate.rollback(undefined, true);

    const [batch2, log2] = await db.migrate.latest();
    expect(batch2).toBeGreaterThan(0);
    expect(log2.length).toBeGreaterThan(0);
  });

  test("expected tables exist after migrate latest", async () => {
    await db.migrate.latest();

    const result = await db.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `);

    const tableNames = result.rows.map((r) => r.table_name);

    const expectedTables = [
      "users",
      "periods",
      "students",
      "classrooms",
      "seating_charts",
      "student_constraints",
    ];

    for (const t of expectedTables) {
      expect(tableNames).toContain(t);
    }
  });

  test("FK constraints enforced — period with nonexistent user_username throws", async () => {
    await db.migrate.latest();

    await expect(
      db("periods").insert({
        user_username: "nonexistent_user",
        school_year: "2025-2026",
        title: "Period 1",
        number: 1,
      })
    ).rejects.toThrow();
  });

  test("cascade delete — deleting user removes periods and students", async () => {
    await db.migrate.latest();

    const pw = await bcrypt.hash("test", 1);

    // Insert a user
    await db("users").insert({
      username: "testuser",
      password: pw,
      email: "test@test.com",
      title: "Mr.",
      first_name: "Test",
      last_name: "User",
      is_admin: false,
    });

    // Insert a period
    const [period] = await db("periods")
      .insert({
        user_username: "testuser",
        school_year: "2025-2026",
        title: "Period 1",
        number: 1,
      })
      .returning("period_id");

    const periodId = period.period_id || period;

    // Insert a student
    await db("students").insert({
      period_id: periodId,
      name: "Student One",
    });

    // Delete the user — should cascade
    await db("users").where({ username: "testuser" }).del();

    // Verify period and student are gone
    const periods = await db("periods").where({ user_username: "testuser" });
    expect(periods).toHaveLength(0);

    const students = await db("students").where({ period_id: periodId });
    expect(students).toHaveLength(0);
  });
});
