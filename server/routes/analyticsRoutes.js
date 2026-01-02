const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(authenticateToken, isAdmin);

router.get('/matriculas-por-canal', analyticsController.getMatriculasPorCanal);
router.get('/novos-contatos-mes', analyticsController.getNovosContatosMes);
router.get('/matriculas-por-polo', analyticsController.getMatriculasPorPolo);

module.exports = router;
