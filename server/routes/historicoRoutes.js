const express = require('express');
const router = express.Router({ mergeParams: true }); 
const historicoController = require('../controllers/historicoController');

router.get('/', historicoController.getHistoricoPorContatoId);

module.exports = router;
