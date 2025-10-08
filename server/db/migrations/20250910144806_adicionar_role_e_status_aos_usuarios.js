exports.up = function(knex) {
  return knex.schema.table('usuarios', function(table) {
    // 'admin' ou 'user'. Por padrão, toda nova conta será 'user'.
    table.string('role').notNullable().defaultTo('user');
    // true se a conta estiver ativa, false se desativada.
    table.boolean('is_active').notNullable().defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.table('usuarios', function(table) {
    table.dropColumn('role');
    table.dropColumn('is_active');
  });
};