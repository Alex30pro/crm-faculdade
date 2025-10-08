const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams é importante para pegar o ID da rota pai
const historicoController = require('../controllers/historicoController');

// A URL final será /api/contatos/:contatoId/historico
router.get('/', historicoController.getHistoricoPorContatoId);

module.exports = router;