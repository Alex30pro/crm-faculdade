// EM: server/db/connection.js (VERSÃO FINAL E ROBUSTA)

const knex = require('knex');
const config = require('../knexfile.js');

// Esta linha verifica se estamos em 'production' (no Render) ou 'development' (no seu PC)
const environment = process.env.NODE_ENV || 'development';

// Com base no ambiente, ele pega o bloco de configuração correto do knexfile.js
const environmentConfig = config[environment];

console.log(`[Knex] Usando o ambiente: ${environment}`); // Log para sabermos qual ambiente está sendo usado

// Cria a conexão com o banco de dados usando a configuração correta
const connection = knex(environmentConfig);

module.exports = connection;