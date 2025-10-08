// server/routes/contatosRoutes.js
const express = require('express');
const router = express.Router();

const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

const {
    getAllContatos,
    createContato,
    updateContato,
    deleteContato,
    getDeletedContatos,
    restaurarContato,
    getContatoById,
    agendarLembrete,
    removerLembrete,
    permanentDeleteContato,
    registrarInteracaoManual,
    exportarParaXLSX 
} = require('../controllers/contatoController');

const historicoRoutes = require('./historicoRoutes');

// Rotas GERAIS (sem ID)
router.get('/', authenticateToken, getAllContatos);
router.post('/', authenticateToken, createContato);
router.get('/lixeira', authenticateToken, getDeletedContatos);

// Rota de exportação (específica) vem ANTES da rota genérica com /:id
router.get('/export', authenticateToken, exportarParaXLSX );

// Rotas ESPECÍFICAS por ID de contato
router.get('/:id', authenticateToken, getContatoById);
router.put('/:id', authenticateToken, updateContato);
router.delete('/:id', authenticateToken, deleteContato);
router.put('/:id/restaurar', authenticateToken, restaurarContato);

// Rotas de Lembrete (específicas por ID)
router.post('/:id/lembrete', authenticateToken, agendarLembrete);
router.delete('/:id/lembrete', authenticateToken, removerLembrete);

// Rota ESPECIAL DE ADMIN por ID
router.delete('/:id/permanent', authenticateToken, isAdmin, permanentDeleteContato);

// Rotas de Histórico por ID
router.post('/:id/historico', authenticateToken, registrarInteracaoManual);
router.use('/:id/historico', historicoRoutes);

module.exports = router;