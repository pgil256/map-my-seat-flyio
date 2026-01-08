exports.up = function(knex) {
  return knex.schema.alterTable('seating_charts', function(table) {
    table.string('label', 100);
    table.integer('period_id').references('period_id').inTable('periods').onDelete('CASCADE');
    // Note: created_at already added by 20260107120000_add_timestamps.js
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('seating_charts', function(table) {
    table.dropColumn('label');
    table.dropColumn('period_id');
  });
};
