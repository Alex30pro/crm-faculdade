exports.up = function(knex) {
  return knex.schema.table('status', function(table) {

    table.string('cor').notNullable().defaultTo('#808080');
  });
};

exports.down = function(knex) {
  return knex.schema.table('status', function(table) {
    table.dropColumn('cor');
  });
};
