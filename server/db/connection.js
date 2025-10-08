// 1. Importar o Knex, que é a nossa ferramenta de comunicação com o banco.
const knex = require('knex');

// 2. Importar as configurações do nosso banco de dados que estão no knexfile.js.
// O '../' significa que estamos "voltando" uma pasta para encontrar o arquivo.
const config = require('../knexfile');

// 3. Inicializar a conexão com o banco usando as configurações do ambiente 'development'.
const db = knex(config.development);

// 4. Exportar a variável 'db'. É ela que os outros arquivos usarão para fazer
//    consultas no banco de dados (buscar, inserir, deletar, etc.).
module.exports = db;