const db = require('../db/connection');

const API_KEYS = {
    'CHAVE_SECRETA_PARA_PONTA_GROSSA': 1,
    'CHAVE_SECRETA_PARA_IPIRANGA': 2,   
    'CHAVE_SECRETA_PARA_CASTRO': 3,     
};

exports.createLead = async (req, res) => {
    try {

        const apiKey = req.headers['x-api-key'];
        
        const poloId = API_KEYS[apiKey];

        if (!poloId) {

            return res.status(401).json({ message: 'Acesso não autorizado.' });
        }

        const { nome, email, telefone, curso_interesse } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ message: 'Nome e e-mail são obrigatórios.' });
        }
        
        const [novoContato] = await db('contatos').insert({
            nome,
            email,
            telefone,
            curso_interesse,
            polo_id: poloId,
            status_id: 1, 
            canal_aquisicao: 'Site'
        }).returning('*');

        res.status(201).json({ message: 'Cadastro recebido com sucesso!', contato: novoContato });

    } catch (error) {
        console.error("Erro ao receber lead:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
