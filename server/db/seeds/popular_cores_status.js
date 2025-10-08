exports.seed = async function(knex) {
  // Atualiza cada status com uma cor específica
  await knex('status').where({ nome_status: 'Matriculado' }).update({ cor: '#28a745' }); // Verde
  await knex('status').where({ nome_status: 'Pendente' }).update({ cor: '#ffc107' });    // Amarelo
  await knex('status').where({ nome_status: 'Em Negociação' }).update({ cor: '#17a2b8' }); // Azul Ciano
  await knex('status').where({ nome_status: 'Desistiu' }).update({ cor: '#dc3545' });     // Vermelho
};