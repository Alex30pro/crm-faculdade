const db = require('../db/connection');

const getHistoricoPorContatoId = async (req, res) => {
    try {
        const { id } = req.params; 

        const historico = await db('historico_contatos')
            .join('usuarios', 'historico_contatos.usuario_id', '=', 'usuarios.id')
            .where({ contato_id: id })
            .select(
                'historico_contatos.id',
                'historico_contatos.tipo_acao',
                'historico_contatos.descricao',
                'historico_contatos.created_at',
                'usuarios.nome as nome_usuario' 
            )
            .orderBy('historico_contatos.created_at', 'desc'); 

        res.json(historico);
    } catch (error) {
        console.error("Erro no controller ao buscar histórico:", error);
        res.status(500).json({ error: 'Erro ao buscar histórico do contato.' });
    }
};

module.exports = {
    getHistoricoPorContatoId,
};
