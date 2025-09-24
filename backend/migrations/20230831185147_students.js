/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("students", function (table) {
    table.increments("student_id").primary();
    table
      .integer("period_id")
      .notNullable()
      .references("period_id")
      .inTable("periods")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.integer("grade");
    table.string("gender");
    table.boolean("is_ese");
    table.boolean("has_504");
    table.boolean("is_ell");
    table.boolean("is_ebd");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("students");
};
