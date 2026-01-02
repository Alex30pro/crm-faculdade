exports.seed = async function(knex) {

  await knex('status').where({ nome_status: 'Matriculado' }).update({ cor: '#28a745' }); 
  await knex('status').where({ nome_status: 'Pendente' }).update({ cor: '#ffc107' });    
  await knex('status').where({ nome_status: 'Em Negociação' }).update({ cor: '#17a2b8' }); 
  await knex('status').where({ nome_status: 'Desistiu' }).update({ cor: '#dc3545' });     
};
