exports.up = async function(knex) {
  await knex.schema.alterTable('seating_charts', function(table) {
    table.string('label', 100);
    table.integer('period_id').references('period_id').inTable('periods').onDelete('CASCADE');
  });

  const hasCreatedAt = await knex.schema.hasColumn('seating_charts', 'created_at');
  if (!hasCreatedAt) {
    await knex.schema.alterTable('seating_charts', function(table) {
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
};

exports.down = async function(knex) {
  await knex.schema.alterTable('seating_charts', function(table) {
    table.dropColumn('label');
    table.dropColumn('period_id');
  });

  // Only drop created_at if the timestamps migration (20260107120000) has
  // already been rolled back (i.e. the column would have been re-added by
  // this migration's up).  When rolling back in order, the timestamps
  // migration handles its own created_at removal.
  const hasCreatedAt = await knex.schema.hasColumn('seating_charts', 'created_at');
  if (hasCreatedAt) {
    // Check whether the timestamps migration is still applied by looking at
    // whether another table (users) still has its created_at column.  If it
    // does, the timestamps migration is still up and owns created_at on
    // seating_charts, so we should NOT drop it here.
    const usersHasCreatedAt = await knex.schema.hasColumn('users', 'created_at');
    if (!usersHasCreatedAt) {
      await knex.schema.alterTable('seating_charts', function(table) {
        table.dropColumn('created_at');
      });
    }
  }
};
