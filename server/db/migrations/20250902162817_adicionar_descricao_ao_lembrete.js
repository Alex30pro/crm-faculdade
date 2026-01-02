exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {

    table.string('lembrete_descricao');
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) {
    table.dropColumn('lembrete_descricao');
  });
};
