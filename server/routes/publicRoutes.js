// EM: server/routes/publicRoutes.js

const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController'); // Vamos criar este arquivo a seguir

// Rota para receber o cadastro (lead) dos sites externos
router.post('/lead', publicController.createLead);

module.exports = router;