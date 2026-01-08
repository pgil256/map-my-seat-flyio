exports.up = function(knex) {
  return knex.schema.alterTable('seating_charts', function(table) {
    table.string('label', 100);
    table.integer('period_id').references('period_id').inTable('periods').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('seating_charts', function(table) {
    table.dropColumn('label');
    table.dropColumn('period_id');
    table.dropColumn('created_at');
  });
};
