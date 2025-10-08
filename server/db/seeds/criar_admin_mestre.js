// EM: server/db/seeds/criar_admin_mestre.js
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Dados do nosso novo super-admin
  const novoAdmin = {
    nome: 'Admin Master',
    email: 'admin@crm.com',
    senhaPlana: 'master123', // Senha em texto puro
    role: 'Admin',
    is_active: true
  };

  console.log(`Verificando se o usuário ${novoAdmin.email} já existe...`);
  // Deleta o usuário se ele já existir, para garantir um início limpo
  await knex('usuarios').where({ email: novoAdmin.email }).del();
  console.log('Usuário antigo (se existia) removido.');

  // Criptografa a nova senha
  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash(novoAdmin.senhaPlana, salt);
  console.log('Senha criptografada com sucesso.');

  // Insere o novo usuário no banco de dados
  await knex('usuarios').insert({
    nome: novoAdmin.nome,
    email: novoAdmin.email,
    senha_hash: senhaHash,
    role: novoAdmin.role,
    is_active: novoAdmin.is_active
  });

  console.log('----------------------------------------------------');
  console.log('Usuário Admin Master criado com sucesso!');
  console.log(`E-mail: ${novoAdmin.email}`);
  console.log(`Senha: ${novoAdmin.senhaPlana}`);
  console.log('----------------------------------------------------');
};