const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);

router.post('/mudar-senha', authenticateToken, authController.mudarSenha);

router.post('/register', authenticateToken, isAdmin, authController.register);

module.exports = router;
