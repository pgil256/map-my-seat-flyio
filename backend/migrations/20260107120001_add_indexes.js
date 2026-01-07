/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("periods", (table) => {
      table.index("user_username", "idx_periods_user_username");
    })
    .alterTable("students", (table) => {
      table.index("period_id", "idx_students_period_id");
    })
    .alterTable("classrooms", (table) => {
      table.index("user_username", "idx_classrooms_user_username");
    })
    .alterTable("seating_charts", (table) => {
      table.index("classroom_id", "idx_seating_charts_classroom_id");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable("periods", (table) => {
      table.dropIndex("user_username", "idx_periods_user_username");
    })
    .alterTable("students", (table) => {
      table.dropIndex("period_id", "idx_students_period_id");
    })
    .alterTable("classrooms", (table) => {
      table.dropIndex("user_username", "idx_classrooms_user_username");
    })
    .alterTable("seating_charts", (table) => {
      table.dropIndex("classroom_id", "idx_seating_charts_classroom_id");
    });
};
