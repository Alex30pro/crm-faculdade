// EM: server/db/seeds/_initial_users.js (VERSÃO FINAL E ROBUSTA)

const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    // 1. Define a lista de usuários que queremos garantir que existam
    const initialUsers = [
        {
            nome: 'Admin Master',
            email: 'admin@crm.com',
            senha: 'admin', // Senha em texto puro, vamos gerar o hash
            role: 'admin',
            is_active: true
        },
        {
            nome: 'Carolina',
            email: 'carolina@gmail.com',
            senha: 'senha123',
            role: 'user',
            is_active: true
        },
        // Adicione outros usuários iniciais aqui se desejar
    ];

    // 2. Itera sobre cada usuário da lista
    for (const userData of initialUsers) {
        // Procura se um usuário com este email já existe
        const userExists = await knex('usuarios').where({ email: userData.email }).first();
        
        // Gera o hash da senha
        const hashedPassword = await bcrypt.hash(userData.senha, 10);

        if (userExists) {
            // Se o usuário existe, ATUALIZA (UPDATE) os dados dele
            console.log(`Usuário ${userData.email} já existe. Atualizando dados...`);
            await knex('usuarios').where({ id: userExists.id }).update({
                nome: userData.nome,
                senha_hash: hashedPassword, // Garante que a senha seja a padrão
                role: userData.role,
                is_active: userData.is_active
            });
        } else {
            // Se o usuário NÃO existe, INSERE (INSERT) ele
            console.log(`Criando usuário ${userData.email}...`);
            await knex('usuarios').insert({
                nome: userData.nome,
                email: userData.email,
                senha_hash: hashedPassword,
                role: userData.role,
                is_active: userData.is_active
            });
        }
    }
};