// EM: server/db/seeds/seu_novo_arquivo_resetar_senha.js

const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // --- DEFINA O USUÁRIO E A NOVA SENHA AQUI ---
  const adminEmail = 'alexandryopg@hotmail.com'; // O e-mail do admin que você quer resetar
  const novaSenha = 'admin123'; // A nova senha
  // ---------------------------------------------

  console.log(`Iniciando o reset de senha para o usuário: ${adminEmail}...`);

  // Criptografa a nova senha
  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash(novaSenha, salt);
  
  console.log('Nova senha criptografada com sucesso.');

  // Atualiza o usuário no banco de dados
  await knex('usuarios')
    .where({ email: adminEmail })
    .update({ senha_hash: senhaHash });

  console.log(`Senha do usuário ${adminEmail} foi atualizada para '${novaSenha}'. Use esta nova senha para fazer o login.`);
};