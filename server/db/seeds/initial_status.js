// server/db/seeds/initial_status.js
exports.seed = async function(knex) {
  // Deleta dados existentes
  await knex('status').del()
  // Insere os novos dados
  await knex('status').insert([
    { id: 1, nome_status: 'Pendente', cor_hex: '#ffc107' }, // Amarelo
    { id: 2, nome_status: 'Matriculado', cor_hex: '#28a745' }, // Verde
    { id: 3, nome_status: 'Desistiu', cor_hex: '#dc3545' }, // Vermelho
    { id: 4, nome_status: 'Em Negociação', cor_hex: '#007bff' } // Azul
  ]);
};