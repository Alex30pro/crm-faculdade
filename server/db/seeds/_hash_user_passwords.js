// server/db/seeds/hash_user_passwords.js

const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // 1. Definir a senha padrão que vamos usar
  const senhaPadrao = 'senha123';

  // 2. Definir o "custo" do hash. 10 é um bom valor padrão.
  const saltRounds = 10;

  // 3. Criar o hash da senha. Esta é uma operação assíncrona.
  console.log('Gerando hash para a senha...');
  const senhaHash = await bcrypt.hash(senhaPadrao, saltRounds);
  console.log('Hash gerado com sucesso!');

  // 4. Atualizar os usuários existentes com a nova senha hasheada.
  // Usamos Promise.all para rodar todas as atualizações em paralelo.
  return Promise.all([
    knex('usuarios').where({ id: 1 }).update({ senha_hash: senhaHash }),
    knex('usuarios').where({ id: 2 }).update({ senha_hash: senhaHash }),
    knex('usuarios').where({ id: 3 }).update({ senha_hash: senhaHash })
  ]).then(() => {
    console.log('Senhas dos usuários atualizadas com a versão hasheada.');
  });
};