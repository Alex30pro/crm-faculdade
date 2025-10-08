exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {
    // Cria a coluna 'criado_por' e a liga com a tabela 'usuarios'
    table.integer('criado_por').unsigned().references('id').inTable('usuarios');
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) {
    table.dropColumn('criado_por');
  });
};