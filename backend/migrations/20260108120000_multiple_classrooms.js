exports.up = function(knex) {
  return knex.schema.alterTable('classrooms', function(table) {
    table.string('name', 100).defaultTo('My Classroom');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('classrooms', function(table) {
    table.dropColumn('name');
  });
};
