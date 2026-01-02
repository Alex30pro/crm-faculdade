exports.up = function(knex) {

  return knex.schema.alterTable('contatos', function(table) {

    table.timestamp('deletado_em').defaultTo(null);
  });
};

exports.down = function(knex) {

  return knex.schema.alterTable('contatos', function(table) {

    table.dropColumn('deletado_em');
  });
};
