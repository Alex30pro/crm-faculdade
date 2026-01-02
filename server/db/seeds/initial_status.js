exports.seed = async function(knex) {

  await knex('status').del()

  await knex('status').insert([
    { id: 1, nome_status: 'Pendente', cor_hex: '#ffc107' }, 
    { id: 2, nome_status: 'Matriculado', cor_hex: '#28a745' }, 
    { id: 3, nome_status: 'Desistiu', cor_hex: '#dc3545' }, 
    { id: 4, nome_status: 'Em Negociação', cor_hex: '#007bff' } 
  ]);
};
