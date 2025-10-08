// dentro do novo arquivo em server/db/migrations/

exports.up = function(knex) {
  return knex.schema
    // 1. Tabela de Usuários
    .createTable('usuarios', function(table) {
      table.increments('id').primary();
      table.string('nome', 100).notNullable();
      table.string('email', 255).notNullable().unique(); // Email para login
      table.string('senha_hash', 255).notNullable(); // Guardaremos a senha criptografada aqui
      table.timestamps(true, true);
    })
    // 2. Tabela de Histórico
    .createTable('historico_contatos', function(table) {
      table.increments('id').primary();
      
      // Conexão com a tabela de contatos
      table.integer('contato_id').unsigned().notNullable().references('id').inTable('contatos');
      
      // Conexão com a tabela de usuários (para saber QUEM fez a ação)
      table.integer('usuario_id').unsigned().notNullable().references('id').inTable('usuarios');

      table.string('tipo_acao', 100).notNullable(); // Ex: "Criação", "Mudança de Status", "Nota"
      table.text('descricao'); // Ex: "Status alterado de 'Pendente' para 'Matriculado'."
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  // A ordem de remoção é a inversa da criação para não quebrar as chaves estrangeiras
  return knex.schema
    .dropTable('historico_contatos')
    .dropTable('usuarios');
};