// server/db/seeds/initial_users.js

exports.seed = async function(knex) {
  // Deleta usuários existentes para não duplicar
  await knex('usuarios').del();

  // Insere os novos usuários
  await knex('usuarios').insert([
    // IMPORTANTE: Em um sistema real, NUNCA guardamos a senha assim.
    // Usaremos uma biblioteca para criptografar (hashing) a senha quando fizermos o login.
    // Por enquanto, "senha123" é só um placeholder.
    { id: 1, nome: 'Carla', email: 'carla@exemplo.com', senha_hash: 'senha123' },
    { id: 2, nome: 'Karol', email: 'karol@exemplo.com', senha_hash: 'senha123' },
    { id: 3, nome: 'Jessica', email: 'jessica@exemplo.com', senha_hash: 'senha123' }
  ]);
};