exports.up = function(knex) {
  return knex.schema.createTable('polos', function(table) {
    table.increments('id').primary();
    table.string('nome_polo').notNullable();
  })
  .then(function () {
    // Insere os polos iniciais
    return knex('polos').insert([
      { nome_polo: 'Ponta Grossa' },
      { nome_polo: 'Castro' },
      { nome_polo: 'Ipiranga' }
    ]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('polos');
};