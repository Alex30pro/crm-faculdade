exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {
    // Coluna para armazenar o texto do lembrete
    table.string('lembrete_descricao');
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) {
    table.dropColumn('lembrete_descricao');
  });
};