// server/controllers/contatoController.js (VERSÃO FINAL E CORRIGIDA)

const ExcelJS = require('exceljs');
const db = require('../db/connection');

const getAllContatos = async (req, res) => {
     try {
        // 1. Pega os parâmetros da URL (ex: /api/contatos?status=1&search=Alex)
        const { status, polo, responsavel, search } = req.query;

        // 2. A base da nossa consulta, já fazendo os JOINS para pegar os nomes
        const query = db('contatos')
            .select(
                'contatos.*',
                'status.nome_status as status',
                'status.cor as status_cor',
                'polos.nome_polo'
            )
            .leftJoin('status', 'contatos.status_id', 'status.id')
            .leftJoin('polos', 'contatos.polo_id', 'polos.id')
            .where('contatos.deletado_em', null) // Garante que não estamos pegando contatos da lixeira
            .orderBy('contatos.created_at', 'desc');

        // 3. Adiciona os filtros dinamicamente, SE eles existirem
        if (status) {
            query.where('contatos.status_id', status);
        }
        if (polo) {
            query.where('contatos.polo_id', polo);
        }
        if (responsavel) {
            // Assumindo que a coluna se chama 'criado_por'
            query.where('contatos.criado_por', responsavel);
        }

        // 4. Adiciona a lógica de BUSCA, SE o termo de busca existir
        if (search) {
            query.where(builder => {
                builder.where('contatos.nome', 'like', `%${search}%`)
                       .orWhere('contatos.email', 'like', `%${search}%`)
                       .orWhere('contatos.telefone', 'like', `%${search}%`);
            });
        }

        // 5. Executa a consulta finalmente montada
        const contatos = await query;
        res.json(contatos);

    } catch (error) {
        console.error("Erro ao buscar contatos:", error);
        res.status(500).json({ message: "Erro interno ao buscar contatos." });
    }
};

const createContato = async (req, res) => {
    // 1. Pega o ID do usuário do TOKEN (a forma correta e segura)
    const criado_por = req.user.id; 
    
    // 2. Pega os dados do contato do corpo da requisição
    const { 
        nome, email, telefone, status_id, polo_id, 
        curso_interesse, canal_aquisicao 
    } = req.body;

    // 3. Validação robusta (agora verifica os campos certos)
    if (!nome || !polo_id || !status_id) {
        return res.status(400).json({ message: 'Nome, Polo e Status são campos obrigatórios.' });
    }

    try {
        const novoContatoData = {
            nome,
            email,
            telefone,
            status_id,
            polo_id,
            curso_interesse,
            canal_aquisicao,
            criado_por // 4. Salva o ID do usuário que criou o contato
        };

        // Insere o contato e pega o ID do novo registro
        const [id] = await db('contatos').insert(novoContatoData);

        // Insere o registro de criação no histórico, usando o ID do token
        await db('historico_contatos').insert({
            contato_id: id,
            usuario_id: criado_por, 
            tipo_acao: 'Criação',
            descricao: `Contato "${nome}" foi criado.`
        });

        res.status(201).json({ message: 'Contato criado com sucesso!', id });

    } catch (error) {
        console.error("Erro no controller ao criar contato:", error);
        res.status(500).json({ message: 'Erro interno ao criar o contato.' });
    }
};

const updateContato = async (req, res) => {
    const { id } = req.params;
    const dadosRecebidos = req.body;
    const usuarioId = req.user.id;

    try {
        await db.transaction(async trx => {
            const contatoAtual = await trx('contatos').where({ id }).first();
            if (!contatoAtual) {
                throw new Error('Contato não encontrado.');
            }

            // LÓGICA DO LEMBRETE AUTOMÁTICO (mantida)
            if (dadosRecebidos.status_id && dadosRecebidos.status_id != contatoAtual.status_id) {
                const novoStatus = await trx('status').where({ id: dadosRecebidos.status_id }).first();
                if (novoStatus && ['Matriculado', 'Desistiu'].includes(novoStatus.nome_status) && contatoAtual.lembrete_ativo) {
                    dadosRecebidos.lembrete_ativo = false;
                    dadosRecebidos.lembrete_data = null;
                    dadosRecebidos.lembrete_descricao = null;
                    await trx('historico_contatos').insert({
                        contato_id: id,
                        usuario_id: usuarioId,
                        tipo_acao: 'Sistema',
                        descricao: `Lembrete desativado automaticamente devido à mudança de status para "${novoStatus.nome_status}".`
                    });
                }
            }

            // --- A GRANDE MUDANÇA ESTÁ AQUI ---
            // LÓGICA DE HISTÓRICO QUE IGNORA MUDANÇAS DE null PARA ""
            const mudancas = [];
            
            // Função auxiliar para normalizar valores (tratar null e undefined como string vazia)
            const normalizar = (valor) => valor || '';

            const camposParaVerificar = ['nome', 'email', 'telefone', 'cpf', 'rg', 'data_nascimento', 'endereco_cep', 'endereco_rua', 'endereco_numero', 'endereco_bairro', 'endereco_cidade', 'endereco_estado', 'curso_interesse', 'canal_aquisicao'];
            
            camposParaVerificar.forEach(campo => {
                if (dadosRecebidos.hasOwnProperty(campo)) {
                    // Compara os valores "normalizados"
                    if (normalizar(contatoAtual[campo]) !== normalizar(dadosRecebidos[campo])) {
                        const nomeCampo = campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Deixa o nome bonito
                        mudancas.push(`${nomeCampo} alterado para "${dadosRecebidos[campo]}".`);
                    }
                }
            });
            
            if (dadosRecebidos.status_id && contatoAtual.status_id !== Number(dadosRecebidos.status_id)) {
                const statusAtual = await trx('status').where({ id: contatoAtual.status_id }).first();
                const novoStatus = await trx('status').where({ id: dadosRecebidos.status_id }).first();
                if(statusAtual && novoStatus) mudancas.push(`Status alterado de "${statusAtual.nome_status}" para "${novoStatus.nome_status}".`);
            }
            if (dadosRecebidos.polo_id && contatoAtual.polo_id !== Number(dadosRecebidos.polo_id)) {
                const poloAtual = await trx('polos').where({ id: contatoAtual.polo_id }).first();
                const novoPolo = await trx('polos').where({ id: dadosRecebidos.polo_id }).first();
                if(novoPolo) mudancas.push(`Polo alterado de "${poloAtual ? poloAtual.nome_polo : 'N/A'}" para "${novoPolo.nome_polo}".`);
            }

            // ATUALIZAÇÃO FINAL DO CONTATO
            dadosRecebidos.updated_at = db.fn.now();
            await trx('contatos').where({ id }).update(dadosRecebidos);

            // SALVA O HISTÓRICO APENAS SE HOUVE MUDANÇAS REAIS
            if (mudancas.length > 0) {
                await trx('historico_contatos').insert({
                    contato_id: id,
                    usuario_id: usuarioId,
                    tipo_acao: 'Atualização',
                    descricao: mudancas.join(' ')
                });
            }
        });

        res.json({ message: 'Contato atualizado com sucesso.' });

    } catch (error) {
        console.error("Erro no controller ao atualizar contato:", error);
        res.status(500).json({ error: error.message || 'Erro ao atualizar contato.' });
    }
};

// Esta função realiza o SOFT DELETE (move para a lixeira)
const deleteContato = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;

    try {
        const contato = await db('contatos').where({ id }).first();
        if (!contato) {
            return res.status(404).json({ message: 'Contato não encontrado.' });
        }

        const usuario = await db('usuarios').where({ id: usuarioId }).first();

        await db('contatos').where({ id }).update({
            deletado_em: db.fn.now(),
            deletado_por: usuario.nome
        });

        await db('historico_contatos').insert({
            contato_id: id,
            usuario_id: usuarioId,
            tipo_acao: 'Exclusão',
            descricao: `Contato "${contato.nome}" movido para a lixeira.`
        });

        res.status(200).json({ message: 'Contato movido para a lixeira com sucesso.' });

    } catch (error) {
        console.error("Erro no controller ao excluir contato:", error);
        res.status(500).json({ message: 'Erro interno ao excluir o contato.' });
    }
};

const getAllStatus = async (req, res) => {
    try {
        const status = await db('status').select('*');
        res.json(status);
    } catch (error) {
        console.error("Erro no controller ao buscar status:", error);
        res.status(500).json({ error: 'Erro ao buscar status.' });
    }
};

const getDeletedContatos = async (req, res) => {
    try {
        const subquery = db('historico_contatos')
            .select('usuario_id')
            .whereRaw('historico_contatos.contato_id = contatos.id')
            .andWhere('tipo_acao', 'Exclusão')
            .orderBy('created_at', 'desc')
            .limit(1);

        const contatosDeletados = await db('contatos')
            .join('status', 'contatos.status_id', '=', 'status.id')
            .leftJoin('usuarios', 'usuarios.id', subquery)
            .select(
                'contatos.id',
                'contatos.nome',
                'contatos.email',
                'contatos.deletado_em',
                'status.nome_status as status',
                'usuarios.nome as excluido_por'
            )
            .whereNotNull('contatos.deletado_em');

        res.json(contatosDeletados);
    } catch (error) {
        console.error("Erro no controller ao buscar contatos da lixeira:", error);
        res.status(500).json({ error: 'Erro ao buscar contatos da lixeira.' });
    }
};

const restaurarContato = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id = 1 } = req.body;

        const contato = await db('contatos').where({ id: id }).first();
        if (!contato) {
            return res.status(404).json({ error: 'Contato não encontrado na lixeira.' });
        }

        await db('contatos').where({ id: id }).update({ deletado_em: null });

        await db('historico_contatos').insert({
            contato_id: id,
            usuario_id: usuario_id,
            tipo_acao: 'Restauração',
            descricao: `Contato "${contato.nome}" foi restaurado da lixeira.`
        });

        res.json({ message: 'Contato restaurado com sucesso.' });
    } catch (error) {
        console.error("Erro no controller ao restaurar contato:", error);
        res.status(500).json({ error: 'Erro ao restaurar contato.' });
    }
};

const agendarLembrete = async (req, res) => {
    const { id } = req.params;
    const { dataLembrete, lembreteDescricao } = req.body;

    if (!dataLembrete) {
        return res.status(400).json({ message: 'A data do lembrete é obrigatória.' });
    }

    try {
        const updatedCount = await db('contatos').where({ id }).update({
            lembrete_data: dataLembrete,
            lembrete_ativo: true,
            lembrete_descricao: lembreteDescricao || '' // Garante que não seja nulo
        });

        // Adiciona uma verificação para saber se o contato foi encontrado
        if (updatedCount === 0) {
            return res.status(404).json({ message: 'Contato não encontrado para agendar lembrete.' });
        }
        
        // Retorna apenas uma mensagem de sucesso
        res.status(200).json({ message: 'Lembrete agendado com sucesso!' });

    } catch (error) {
        console.error("Erro em agendarLembrete:", error);
        res.status(500).json({ message: 'Erro ao agendar lembrete no servidor.' });
    }
};

const removerLembrete = async (req, res) => {
    const { id } = req.params;
    try {
        await db('contatos').where({ id }).update({
            lembrete_data: null,
            lembrete_ativo: false,
        });

        const contatosAtualizados = await db('contatos')
            .join('status', 'contatos.status_id', '=', 'status.id')
            .select('contatos.*', 'status.nome_status as status', 'status.cor_hex as status_cor') // <-- CORREÇÃO APLICADA AQUI
            .whereNull('contatos.deletado_em');
            
        res.status(200).json(contatosAtualizados);

    } catch (error) {
        console.error("Erro em removerLembrete:", error);
        res.status(500).json({ message: 'Erro ao remover lembrete.' });
    }
};

const getContatoById = async (req, res) => {
    const { id } = req.params;
    try {
        const contato = await db('contatos')
            .leftJoin('status', 'contatos.status_id', '=', 'status.id')
            .leftJoin('polos', 'contatos.polo_id', '=', 'polos.id')
            .select(
                'contatos.*',
                'status.nome_status as status',
                'polos.nome_polo as nome_polo'
            )
            .where('contatos.id', id)
            .first(); // .first() para pegar apenas um resultado

        if (contato) {
            res.json(contato);
        } else {
            res.status(404).json({ error: 'Contato não encontrado.' });
        }
    } catch (error) {
        console.error("Erro ao buscar contato por ID:", error);
        res.status(500).json({ error: 'Erro ao buscar contato.' });
    }
};

const permanentDeleteContato = async (req, res) => {
  const { id } = req.params;
  try {
    await db.transaction(async trx => {
      await trx('historico_contatos').where({ contato_id: id }).del();
      await trx('contatos').where({ id }).del();
    });
    res.status(200).json({ message: 'Contato excluído permanentemente.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir o contato.', error: error.message });
  }
};

// --- NOVA FUNÇÃO PARA REGISTRAR INTERAÇÃO MANUAL ---
const registrarInteracaoManual = async (req, res) => {
    const { id: contato_id } = req.params; // Pega o ID do contato da URL
    const { descricao, tipo_acao } = req.body; // Pega os dados enviados pelo front-end
    const usuario_id = req.user.id; // Pega o ID do usuário logado a partir do token

    // Validação simples
    if (!descricao || !tipo_acao) {
        return res.status(400).json({ message: 'A descrição e o tipo da ação são obrigatórios.' });
    }

    try {
        await db('historico_contatos').insert({
            contato_id,
            usuario_id,
            descricao,
            tipo_acao // Ex: "Ligação", "E-mail", "Anotação"
        });

        // Retorna o histórico atualizado para o front-end poder redesenhar a lista
        const historicoAtualizado = await db('historico_contatos')
            .join('usuarios', 'historico_contatos.usuario_id', 'usuarios.id')
            .select('historico_contatos.*', 'usuarios.nome as nome_usuario')
            .where({ contato_id })
            .orderBy('created_at', 'desc');

        res.status(201).json(historicoAtualizado);

    } catch (error) {
        console.error("Erro ao registrar interação manual:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

const exportarParaXLSX = async (req, res) => {
    try {
        // 1. Lógica de busca e filtros (AGORA COMPLETA E CORRIGIDA)
        const { status, polo, responsavel, search } = req.query;

        // AQUI ESTAVA O PROBLEMA: A consulta ao banco precisa ser completa,
        // com todos os selects e joins que você já usava.
        const query = db('contatos')
            .select(
                'contatos.nome',
                'contatos.email',
                'contatos.telefone',
                'status.nome_status as status',
                'polos.nome_polo',
                'contatos.curso_interesse',
                'contatos.canal_aquisicao',
                'usuarios.nome as criado_por' // Busca o nome do usuário que criou
            )
            .leftJoin('status', 'contatos.status_id', 'status.id')
            .leftJoin('polos', 'contatos.polo_id', 'polos.id')
            .leftJoin('usuarios', 'contatos.criado_por', 'usuarios.id') // Faz o JOIN com a tabela de usuários
            .where('contatos.deletado_em', null)
            .orderBy('contatos.created_at', 'desc');

        // Lógica de filtros (não precisa mudar, já estava correta)
        if (status) query.where('contatos.status_id', status);
        if (polo) query.where('contatos.polo_id', polo);
        if (responsavel) query.where('contatos.criado_por', responsavel);

        if (search) {
            query.where(builder => {
                builder.where('contatos.nome', 'like', `%${search}%`)
                       .orWhere('contatos.email', 'like', `%${search}%`)
                       .orWhere('contatos.telefone', 'like', `%${search}%`);
            });
        }

        const contatos = await query;

        // 2. Criar a planilha com ExcelJS (não precisa mudar)
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Relatório de Contatos');

        // 3. Definir o cabeçalho e o estilo (não precisa mudar)
        worksheet.columns = [
            { header: 'Nome do Aluno', key: 'nome', width: 35 },
            { header: 'E-mail', key: 'email', width: 35 },
            { header: 'Telefone', key: 'telefone', width: 20 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Polo', key: 'nome_polo', width: 25 },
            { header: 'Curso de Interesse', key: 'curso_interesse', width: 25 },
            { header: 'Canal de Aquisição', key: 'canal_aquisicao', width: 20 },
            { header: 'Responsável', key: 'criado_por', width: 20 }
        ];

        // Estilo do cabeçalho (não precisa mudar)
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        
        // 4. Adicionar os dados (não precisa mudar)
        worksheet.addRows(contatos);

        // 5. Configurar a resposta do servidor (não precisa mudar)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio_contatos.xlsx"');

        // 6. Enviar a planilha para o navegador (não precisa mudar)
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Erro ao exportar contatos para XLSX:", error);
        res.status(500).json({ message: "Erro interno ao gerar o arquivo Excel." });
    }
};

module.exports = {
    getAllContatos,
    createContato,
    updateContato,
    deleteContato,
    getAllStatus,
    getDeletedContatos,
    restaurarContato,
    agendarLembrete,
    removerLembrete,
    getContatoById,
    permanentDeleteContato,
    registrarInteracaoManual,
    exportarParaXLSX 
};