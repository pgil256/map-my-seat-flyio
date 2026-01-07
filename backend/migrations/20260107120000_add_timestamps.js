/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("users", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .alterTable("periods", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .alterTable("students", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .alterTable("classrooms", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .alterTable("seating_charts", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable("users", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    })
    .alterTable("periods", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    })
    .alterTable("students", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    })
    .alterTable("classrooms", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    })
    .alterTable("seating_charts", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    });
};
