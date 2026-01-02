const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    
    const initialUsers = [
        {
            nome: 'Admin Master',
            email: 'admin@crm.com',
            senha: 'admin', 
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

    ];

    for (const userData of initialUsers) {
       
        const userExists = await knex('usuarios').where({ email: userData.email }).first();
        
        const hashedPassword = await bcrypt.hash(userData.senha, 10);

        if (userExists) {
          
            console.log(`Usuário ${userData.email} já existe. Atualizando dados...`);
            await knex('usuarios').where({ id: userExists.id }).update({
                nome: userData.nome,
                senha_hash: hashedPassword, 
                role: userData.role,
                is_active: userData.is_active
            });
        } else {
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
