/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("seating_charts", function (table) {
    table.increments("seating_chart_id").primary();
    table
      .integer("classroom_id")
      .notNullable()
      .references("classroom_id")
      .inTable("classrooms")
      .onDelete("CASCADE");
    table.integer("number");
    table.json("seating_chart");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("seating_charts");
};
