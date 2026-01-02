const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config'); 

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Falha na verificação do token:', err.name); 

            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Sua sessão expirou. Por favor, faça o login novamente.' });
            }
            
            return res.status(401).json({ message: 'Token inválido ou corrompido.' });
        }
        
        req.user = user;
        next();
    });
};


const isAdmin = (req, res, next) => {

  if (req.user && req.user.role.toLowerCase() === 'admin') {
    next(); 
  } else {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem executar esta ação.' });
  }
};


module.exports = {
  authenticateToken,
  isAdmin
};
