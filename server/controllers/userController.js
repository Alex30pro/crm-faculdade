// Arquivo: server/controllers/userController.js
const db = require('../db/connection');

// Função para listar todos os usuários (para o admin)
const getAllUsers = async (req, res) => {
    try {
        // Seleciona todos os campos, exceto a senha
        const users = await db('usuarios').select('id', 'nome', 'email', 'role', 'is_active').orderBy('nome');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
};

// Função para desativar ou reativar um usuário
const toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body; // Recebe o novo status (true ou false)

    try {
        await db('usuarios').where({ id }).update({ is_active });
        res.json({ message: 'Status do usuário atualizado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status do usuário.' });
    }
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Trava de segurança: impede que um admin se rebaixe se for o último
    if (role !== 'admin') {
        const adminCount = await db('usuarios').where({ role: 'admin', is_active: true }).count('id as count').first();
        const targetUser = await db('usuarios').where({ id }).first();

        if (targetUser.role === 'admin' && adminCount.count <= 1) {
            return res.status(400).json({ message: 'Não é possível remover o último administrador do sistema.' });
        }
    }

    try {
        await db('usuarios').where({ id }).update({ role });
        res.json({ message: 'Cargo do usuário atualizado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar cargo do usuário.' });
    }
};

module.exports = { getAllUsers, toggleUserStatus, updateUserRole };