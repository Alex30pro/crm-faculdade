exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {

    table.string('deletado_por').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) {
    table.dropColumn('deletado_por');
  });
};
