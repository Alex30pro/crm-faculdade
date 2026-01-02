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

router.get('/', authenticateToken, getAllContatos);
router.post('/', authenticateToken, createContato);
router.get('/lixeira', authenticateToken, getDeletedContatos);

router.get('/export', authenticateToken, exportarParaXLSX );

router.get('/:id', authenticateToken, getContatoById);
router.put('/:id', authenticateToken, updateContato);
router.delete('/:id', authenticateToken, deleteContato);
router.put('/:id/restaurar', authenticateToken, restaurarContato);

router.post('/:id/lembrete', authenticateToken, agendarLembrete);
router.delete('/:id/lembrete', authenticateToken, removerLembrete);

router.delete('/:id/permanent', authenticateToken, isAdmin, permanentDeleteContato);

router.post('/:id/historico', authenticateToken, registrarInteracaoManual);
router.use('/:id/historico', historicoRoutes);

module.exports = router;
