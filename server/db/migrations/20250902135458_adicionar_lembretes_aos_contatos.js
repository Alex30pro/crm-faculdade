// Dentro do novo arquivo de migração que você criou

exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {
    // Coluna para armazenar a data e hora do lembrete
    table.datetime('lembrete_data');
    // Coluna para sabermos se um lembrete está ativo ou não
    table.boolean('lembrete_ativo').defaultTo(false).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) {
    table.dropColumn('lembrete_data');
    table.dropColumn('lembrete_ativo');
  });
};