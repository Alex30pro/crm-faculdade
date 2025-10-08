// EM: server/controllers/analyticsController.js

const db = require('../db/connection');

// Gráfico 1: Matriculados por Canal de Aquisição
exports.getMatriculasPorCanal = async (req, res) => {
    try {
        const dados = await db('contatos')
            .join('status', 'contatos.status_id', 'status.id')
            .select('contatos.canal_aquisicao')
            .count('contatos.id as total')
            .where('status.nome_status', 'Matriculado')
            .whereNotNull('contatos.canal_aquisicao')
            .where('contatos.canal_aquisicao', '!=', '')
            .groupBy('contatos.canal_aquisicao')
            .orderBy('total', 'desc');
        res.json(dados);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados por canal.' });
    }
};

// Gráfico 3 (Bônus, mas muito útil): Matriculados por Polo
exports.getMatriculasPorPolo = async (req, res) => {
    try {
        const dados = await db('contatos')
            .join('status', 'contatos.status_id', 'status.id')
            .join('polos', 'contatos.polo_id', 'polos.id')
            .select('polos.nome_polo')
            .count('contatos.id as total')
            .where('status.nome_status', 'Matriculado')
            .groupBy('polos.nome_polo')
            .orderBy('total', 'desc');
        res.json(dados);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados por polo.' });
    }
};

exports.getNovosContatosMes = async (req, res) => {
    try {
        const ano = parseInt(req.query.year) || new Date().getFullYear();
        const mes = parseInt(req.query.month) || new Date().getMonth() + 1;

        // Formatamos as datas como strings no formato YYYY-MM-DD HH:MM:SS
        // para garantir a compatibilidade total com o SQLite na cláusula whereBetween.
        const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01 00:00:00`;

        const ultimoDiaDoMes = new Date(ano, mes, 0).getDate(); // Pega o último dia (ex: 28, 30, 31)
        const ultimoDia = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDiaDoMes} 23:59:59`;

        const dados = await db('contatos')
            .select(db.raw("strftime('%d', created_at) as dia"))
            .count('id as total')
            // Agora a comparação será feita entre textos no mesmo formato
            .whereBetween('created_at', [primeiroDia, ultimoDia])
            .whereNull('deletado_em') // Garante que não estamos contando contatos da lixeira
            .groupBy('dia')
            .orderBy('dia', 'asc');
            
        res.json(dados);
    } catch (error) {
        console.error("Erro ao buscar novos contatos do mês:", error);
        res.status(500).json({ message: 'Erro ao buscar novos contatos do mês.' });
    }
};