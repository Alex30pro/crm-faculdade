// dentro do novo arquivo em server/db/migrations/

exports.up = function(knex) {
  // O 'up' é para aplicar a mudança
  return knex.schema.alterTable('contatos', function(table) {
    // Adiciona uma nova coluna do tipo 'timestamp' (data e hora)
    // chamada 'deletado_em'.
    // Por padrão, o valor dela será NULL, indicando que o contato está ATIVO.
    table.timestamp('deletado_em').defaultTo(null);
  });
};

exports.down = function(knex) {
  // O 'down' é para reverter a mudança, caso seja necessário
  return knex.schema.alterTable('contatos', function(table) {
    // Remove a coluna 'deletado_em' se precisarmos voltar atrás.
    table.dropColumn('deletado_em');
  });
};