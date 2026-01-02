
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); 

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

app.use(express.static(path.join(__dirname, '../client')));

app.use('/api/contatos', contatosRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/polos', poloRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
});
