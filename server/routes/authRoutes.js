// ARQUIVO: server/routes/authRoutes.js (VERSÃO FINAL CORRIGIDA)

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Rota para o login
router.post('/login', authController.login);

// Rota para mudar a senha (DEVE SER POST e precisa do authenticateToken)
router.post('/mudar-senha', authenticateToken, authController.mudarSenha);

// Rota para o cadastro
router.post('/register', authenticateToken, isAdmin, authController.register);

module.exports = router;