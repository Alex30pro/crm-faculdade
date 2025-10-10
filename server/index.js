// EM: server/index.js (VERSÃO FINAL PARA DEPLOY)

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Garante que o .env seja lido

// --- Importação das Rotas (seu código aqui está ótimo) ---
const contatosRoutes = require('./routes/contatosRoutes');
const statusRoutes = require('./routes/statusRoutes');
const authRoutes = require('./routes/authRoutes'); 
const poloRoutes = require('./routes/poloRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Servindo os arquivos estáticos da pasta 'client'
app.use(express.static(path.join(__dirname, '../client')));

// --- Uso das Rotas (seu código aqui está ótimo) ---
app.use('/api/contatos', contatosRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/polos', poloRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);

// Rota principal para redirecionar para o index.html (antigo login.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
});