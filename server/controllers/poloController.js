// Arquivo: server/controllers/poloController.js

const db = require('../db/connection');

const getAllPolos = async (req, res) => {
    try {
        const polos = await db('polos').select('*').orderBy('nome_polo');
        res.json(polos);
    } catch (error) {
        console.error("Erro ao buscar polos:", error);
        res.status(500).json({ error: 'Erro ao buscar polos.' });
    }
};

module.exports = {
    getAllPolos,
};