const db = require('../db/connection');

const getAllUsers = async (req, res) => {
    try {

        const users = await db('usuarios').select('id', 'nome', 'email', 'role', 'is_active').orderBy('nome');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
};

const toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body; 
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
