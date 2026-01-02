exports.up = function(knex) {
  return knex.schema
    
    .createTable('usuarios', function(table) {
      table.increments('id').primary();
      table.string('nome', 100).notNullable();
      table.string('email', 255).notNullable().unique(); 
      table.string('senha_hash', 255).notNullable(); 
    })
    .createTable('historico_contatos', function(table) {
      table.increments('id').primary();
      
      table.integer('contato_id').unsigned().notNullable().references('id').inTable('contatos');
      
      table.integer('usuario_id').unsigned().notNullable().references('id').inTable('usuarios');

      table.string('tipo_acao', 100).notNullable(); 
      table.text('descricao'); 
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {

  return knex.schema
    .dropTable('historico_contatos')
    .dropTable('usuarios');
};
