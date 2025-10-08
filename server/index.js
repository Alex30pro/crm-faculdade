const express = require('express');
const cors = require('cors');
const path = require('path');

const contatosRoutes = require('./routes/contatosRoutes');
const statusRoutes = require('./routes/statusRoutes');
const authRoutes = require('./routes/authRoutes'); 
const poloRoutes = require('./routes/poloRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
    console.log(`Servidor refatorado rodando na porta ${PORT}.`);
});