exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {

    table.datetime('lembrete_data');

    table.boolean('lembrete_ativo').defaultTo(false).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) {
    table.dropColumn('lembrete_data');
    table.dropColumn('lembrete_ativo');
  });
};
