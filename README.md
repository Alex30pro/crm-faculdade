# CRM Acadêmico - Sistema de Gestão de Contatos

Este projeto é um **Sistema de CRM (Customer Relationship Management)** desenvolvido como estudo aprofundado de arquitetura Web Fullstack.

O foco principal deste repositório é demonstrar a estruturação de uma **API RESTful** escalável e a separação de responsabilidades.

🚧 **Status do Projeto:** Em desenvolvimento (Foco em Backend/Arquitetura).

### 💻 Tecnologias e Arquitetura

O projeto foi construído utilizando o padrão **MVC (Model-View-Controller)**:

- **Backend:** Node.js com Express.
- **Banco de Dados:** SQL (PostgreSQL/MySQL) com Query Builder **Knex.js**.
- **Segurança:** Uso de variáveis de ambiente (`dotenv`) e CORS configurado.
- **Frontend:** HTML5, CSS3 e JavaScript Vanilla (integrado na pasta `client`).

### 📂 Estrutura de Pastas (Destaque)

O código foi organizado para facilitar a manutenção e escalabilidade:

- `/server/controllers`: Lógica de negócios.
- `/server/routes`: Definição de endpoints da API.
- `/server/db`: Configurações de banco de dados e migrações.
- `/server/middlewares`: Tratamento de requisições.

### ⚙️ Como rodar localmente

1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com seu banco de dados local.
4. Execute: `npm start`

---
*Nota: Este projeto foi desenvolvido para ambiente local e estudos de lógica de programação.*
