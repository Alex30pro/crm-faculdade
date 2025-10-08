// dentro do novo arquivo de migração

exports.up = function(knex) {
  return knex.schema.table('contatos', function(table) {
    // Campo para o curso de interesse (texto simples)
    table.string('curso_interesse').nullable();
    
    // Campo para o canal de aquisição (texto simples)
    table.string('canal_aquisicao').nullable();
    
    // Campo para o checklist de documentos (usando JSON)
    // Definimos um valor padrão para que todos os contatos já tenham um checklist inicial.
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