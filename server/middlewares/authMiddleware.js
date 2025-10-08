// server/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config'); // Importa a chave do arquivo central

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // Retornando um JSON para manter o padrão da API
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        // AQUI ESTÁ A MUDANÇA PRINCIPAL
        if (err) {
            console.error('Falha na verificação do token:', err.name); 

            // Se o token expirou, envie uma mensagem clara
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Sua sessão expirou. Por favor, faça o login novamente.' });
            }
            
            // Para outros erros de token (inválido, malformado, etc.)
            return res.status(401).json({ message: 'Token inválido ou corrompido.' });
        }
        
        req.user = user;
        next();
    });
};

// Middleware para verificar se o usuário autenticado é um Admin

const isAdmin = (req, res, next) => {

  if (req.user && req.user.role.toLowerCase() === 'admin') {
    next(); // É um Admin, pode continuar
  } else {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem executar esta ação.' });
  }
};


module.exports = {
  authenticateToken,
  isAdmin
};