// Arquivo: server/routes/userRoutes.js (VERSÃO FINAL E CORRIGIDA)

const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserStatus, updateUserRole } = require('../controllers/userController');

const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, isAdmin, getAllUsers);
router.put('/:id/status', authenticateToken, isAdmin, toggleUserStatus);
router.put('/:id/role', authenticateToken, isAdmin, updateUserRole);


module.exports = router;