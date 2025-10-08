exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {
    // Adiciona a coluna para guardar o nome de quem deletou
    table.string('deletado_por').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) {
    table.dropColumn('deletado_por');
  });
};