const express = require('express');
const router = express.Router();

const { getAllStatus } = require('../controllers/contatoController');

router.get('/', getAllStatus);

module.exports = router;