const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {

  const senhaPadrao = 'senha123';

  const saltRounds = 10;

  console.log('Gerando hash para a senha...');
  const senhaHash = await bcrypt.hash(senhaPadrao, saltRounds);
  console.log('Hash gerado com sucesso!');

  return Promise.all([
    knex('usuarios').where({ id: 1 }).update({ senha_hash: senhaHash }),
    knex('usuarios').where({ id: 2 }).update({ senha_hash: senhaHash }),
    knex('usuarios').where({ id: 3 }).update({ senha_hash: senhaHash })
  ]).then(() => {
    console.log('Senhas dos usuários atualizadas com a versão hasheada.');
  });
};
