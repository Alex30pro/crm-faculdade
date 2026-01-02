exports.up = function(knex) {
  return knex.schema.table('usuarios', function(table) {

    table.string('role').notNullable().defaultTo('user');

    table.boolean('is_active').notNullable().defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.table('usuarios', function(table) {
    table.dropColumn('role');
    table.dropColumn('is_active');
  });
};
