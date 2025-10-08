exports.up = function(knex) {
  return knex.schema.table('status', function(table) {
    // Adiciona a coluna 'cor', tipo texto, e define uma cor padrão (cinza)
    table.string('cor').notNullable().defaultTo('#808080');
  });
};

exports.down = function(knex) {
  return knex.schema.table('status', function(table) {
    table.dropColumn('cor');
  });
};