// Arquivo: server/routes/poloRoutes.js

const express = require('express');
const router = express.Router();
const { getAllPolos } = require('../controllers/poloController');

router.get('/', getAllPolos);

module.exports = router;