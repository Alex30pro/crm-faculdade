// server/knexfile.js
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './crm.db3' // Nome do arquivo do nosso banco de dados
    },
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};