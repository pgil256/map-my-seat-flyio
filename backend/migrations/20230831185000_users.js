/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.string("username", 25).primary();
    table.text("password").notNullable();
    table.text("email").notNullable();
    table.text("title").notNullable();
    table.text("first_name").notNullable();
    table.text("last_name").notNullable();
    table.boolean("is_admin").notNullable().defaultTo(false);
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
