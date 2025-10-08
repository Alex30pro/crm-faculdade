exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {
    // Documentos
    table.string('cpf');
    table.string('rg');
    table.date('data_nascimento');

    // Endereço
    table.string('endereco_cep');
    table.string('endereco_rua');
    table.string('endereco_numero');
    table.string('endereco_bairro');
    table.string('endereco_cidade');
    table.string('endereco_estado');
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) {
    table.dropColumn('cpf');
    table.dropColumn('rg');
    table.dropColumn('data_nascimento');
    table.dropColumn('endereco_cep');
    table.dropColumn('endereco_rua');
    table.dropColumn('endereco_numero');
    table.dropColumn('endereco_bairro');
    table.dropColumn('endereco_cidade');
    table.dropColumn('endereco_estado');
  });
};