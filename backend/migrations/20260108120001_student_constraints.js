exports.up = function(knex) {
  return knex.schema.createTable('student_constraints', function(table) {
    table.increments('constraint_id').primary();
    table.integer('student_id_1').notNullable()
      .references('student_id').inTable('students').onDelete('CASCADE');
    table.integer('student_id_2').notNullable()
      .references('student_id').inTable('students').onDelete('CASCADE');
    table.enu('constraint_type', ['separate', 'pair']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Ensure no duplicate constraints (either direction)
    table.unique(['student_id_1', 'student_id_2']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('student_constraints');
};
