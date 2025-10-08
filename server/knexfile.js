// EM: server/knexfile.js (VERSÃO FINAL COM ESTRUTURA DE CONEXÃO ROBUSTA)

require('dotenv').config();

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './crm.db3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },

  // ===============================================================
  // >> CORREÇÃO IMPORTANTE AQUI <<
  // ===============================================================
  production: {
    client: 'pg',
    // A 'connection' agora é um objeto para incluir o SSL
    connection: {
      connectionString: process.env.DATABASE_URL, // A URL do banco entra aqui
      ssl: { rejectUnauthorized: false }         // O SSL entra AQUI DENTRO
    },
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};