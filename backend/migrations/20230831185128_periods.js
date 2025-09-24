/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("periods", function (table) {
    table.increments("period_id").primary();
    table
      .string("user_username", 25)
      .notNullable()
      .references("username")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("school_year", 15).notNullable();
    table.string("title", 50);
    table.integer("number");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("periods");
};
