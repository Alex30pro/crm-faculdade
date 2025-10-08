// server/controllers/historicoController.js

const db = require('../db/connection');

// Função para buscar o histórico de um contato específico
const getHistoricoPorContatoId = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID do contato da URL

        const historico = await db('historico_contatos')
            .join('usuarios', 'historico_contatos.usuario_id', '=', 'usuarios.id')
            .where({ contato_id: id })
            .select(
                'historico_contatos.id',
                'historico_contatos.tipo_acao',
                'historico_contatos.descricao',
                'historico_contatos.created_at',
                'usuarios.nome as nome_usuario' // Pega o nome do usuário que fez a ação
            )
            .orderBy('historico_contatos.created_at', 'desc'); // Ordena do mais recente para o mais antigo

        res.json(historico);
    } catch (error) {
        console.error("Erro no controller ao buscar histórico:", error);
        res.status(500).json({ error: 'Erro ao buscar histórico do contato.' });
    }
};

module.exports = {
    getHistoricoPorContatoId,
};