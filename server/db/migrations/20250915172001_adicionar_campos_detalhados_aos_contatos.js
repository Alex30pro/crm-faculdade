exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {

    table.string('curso_interesse').nullable();
    
    table.string('canal_aquisicao').nullable();
    
    const defaultChecklist = JSON.stringify({
      rg: false,
      cpf: false,
      historico_escolar: false,
      comprovante_residencia: false
    });
    table.json('documentos_checklist').notNullable().defaultTo(defaultChecklist);
  });
};

exports.down = function(knex) {
  return knex.schema.table('contatos', function(table) {
    table.dropColumn('curso_interesse');
    table.dropColumn('canal_aquisicao');
    table.dropColumn('documentos_checklist');
  });
};
