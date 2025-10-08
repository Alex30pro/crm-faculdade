// EM: server/routes/analyticsRoutes.js

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Aplica a segurança em todas as rotas deste arquivo
router.use(authenticateToken, isAdmin);

// Define as rotas para cada gráfico
router.get('/matriculas-por-canal', analyticsController.getMatriculasPorCanal);
router.get('/novos-contatos-mes', analyticsController.getNovosContatosMes);
router.get('/matriculas-por-polo', analyticsController.getMatriculasPorPolo);

module.exports = router;