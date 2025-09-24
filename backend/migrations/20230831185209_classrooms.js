/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("classrooms", function (table) {
    table.increments("classroom_id").primary();
    table
      .string("user_username", 25)
      .notNullable()
      .references("username")
      .inTable("users")
      .onDelete("CASCADE");
    table.boolean("seat_alphabetical");
    table.boolean("seat_randomize");
    table.boolean("seat_high_low");
    table.boolean("seat_male_female");
    table.boolean("ese_is_priority");
    table.boolean("ell_is_priority");
    table.boolean("fivezerofour_is_priority");
    table.boolean("ebd_is_priority");
    table.json("seating_config");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("classrooms");
};
