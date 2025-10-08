// Arquivo: ...adicionar_polo_id_aos_contatos.js

exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) { 
    table.integer('polo_id').unsigned().references('id').inTable('polos');
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) { 
    table.dropForeign('polo_id');
    table.dropColumn('polo_id');
  });
};