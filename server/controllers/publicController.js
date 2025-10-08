// EM: server/controllers/publicController.js

const db = require('../db/connection');

// Mapeamento das nossas chaves secretas para os IDs dos Polos no banco de dados
// IMPORTANTE: Estes valores devem ser secretos e nunca expostos no frontend!
const API_KEYS = {
    'CHAVE_SECRETA_PARA_PONTA_GROSSA': 1, // Supondo que o ID do polo Ponta Grossa no seu DB é 1
    'CHAVE_SECRETA_PARA_IPIRANGA': 2,   // Supondo que o ID de Ipiranga é 2
    'CHAVE_SECRETA_PARA_CASTRO': 3,     // Supondo que o ID de Castro é 3
};

exports.createLead = async (req, res) => {
    try {
        // 1. Pega a chave de API do cabeçalho da requisição
        const apiKey = req.headers['x-api-key'];
        
        // 2. Verifica se a chave é válida e encontra o ID do polo
        const poloId = API_KEYS[apiKey];

        if (!poloId) {
            // Se a chave for inválida ou não fornecida, recusa o acesso.
            return res.status(401).json({ message: 'Acesso não autorizado.' });
        }

        // 3. Pega os dados do aluno enviados pelo formulário do site
        const { nome, email, telefone, curso_interesse } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ message: 'Nome e e-mail são obrigatórios.' });
        }
        
        // 4. Insere o novo contato no banco de dados
        // Vamos assumir que novos leads entram com o status 'Pendente' (ID 1)
        const [novoContato] = await db('contatos').insert({
            nome,
            email,
            telefone,
            curso_interesse,
            polo_id: poloId, // Associa ao polo correto!
            status_id: 1, // Status 'Pendente'
            canal_aquisicao: 'Site' // Canal de aquisição padrão
        }).returning('*');

        res.status(201).json({ message: 'Cadastro recebido com sucesso!', contato: novoContato });

    } catch (error) {
        console.error("Erro ao receber lead:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};