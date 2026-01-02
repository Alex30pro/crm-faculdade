exports.up = function(knex) {
  return knex.schema
    .createTable('status', function(table) {
      table.increments('id').primary();
      table.string('nome_status', 100).notNullable();
      table.string('cor_hex', 7).notNullable(); 
    })
    .createTable('contatos', function(table) {
      table.increments('id').primary();
      table.string('nome', 255).notNullable();
      table.string('email', 255);
      table.string('telefone', 50);
      table.integer('status_id').unsigned().references('id').inTable('status'); 
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('contatos')
    .dropTable('status');
};
