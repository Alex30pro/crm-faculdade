// client/js/dashboard.js

import * as api from './modules/api.js';
import * as ui from './modules/ui.js';
import { renderHeader } from './modules/header.js';

// Função Debounce para otimizar a busca, colocada fora para clareza.
function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => { func.apply(this, args); }, delay);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Renderiza o cabeçalho centralizado
    renderHeader();

    // 2. Lógica de autenticação
    const authToken = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!authToken || !user) {
        window.location.href = 'index.html';
        return;
    }

    // --- SELETORES ESPECÍFICOS DO DASHBOARD ---
    const tabelaContatosCorpo = document.querySelector("#contacts-table tbody");
    const formAdicionarContato = document.getElementById('add-contact-form');
    const selectStatusForm = document.getElementById('status_id');
    const selectPoloForm = document.getElementById('polo_id');
    const passwordModal = document.getElementById('password-modal');
    const passwordModalCloseBtn = document.getElementById('password-modal-close-btn');
    const changePasswordForm = document.getElementById('change-password-form');
    const passwordErrorMessage = document.getElementById('password-error-message');
    const lembreteModal = document.getElementById('lembrete-modal');
    const lembreteModalCloseBtn = document.getElementById('lembrete-modal-close-btn');
    const lembreteDatetimeInput = document.getElementById('lembrete-datetime');
    const salvarLembreteBtn = document.getElementById('salvar-lembrete-btn');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const lembreteModoInput = document.getElementById('lembrete-modo');
    const removerLembreteBtn = document.getElementById('remover-lembrete-btn');
    const lembreteDescricaoInput = document.getElementById('lembrete-descricao');
    const detalhesModal = document.getElementById('detalhes-modal');
    const detalhesModalBody = detalhesModal.querySelector('.modal-body');
    const detalhesModalCloseBtn = document.getElementById('detalhes-modal-close-btn');
    const detalhesEditBtn = document.getElementById('detalhes-edit-btn');
    const detalhesSaveBtn = document.getElementById('detalhes-save-btn');
    const detalhesCancelBtn = document.getElementById('detalhes-cancel-btn');
    const detalhesHistoryBtn = document.getElementById('detalhes-history-btn');
    const historyModal = document.getElementById('history-modal');
    const historyModalCloseBtn = document.getElementById('modal-close-btn');
    
    const camposDetalhes = {};
    document.querySelectorAll('[id^="detalhes-"]').forEach(el => {
        camposDetalhes[el.id.replace('detalhes-', '')] = el;
    });
    const camposEdit = {};
    document.querySelectorAll('[id^="edit-"]').forEach(el => {
        camposEdit[el.id.replace('edit-', '')] = el;
    });

    // --- VARIÁVEIS DE ESTADO ---
    let contatoAbertoId = null; 
    let contatoIdParaLembrete = null;
    
    // --- FUNÇÃO CENTRAL DE BUSCA E RENDERIZAÇÃO ---
    async function buscarErenderizarContatos() {
        const searchInput = document.getElementById('search-input');
        const statusFilter = document.getElementById('filter-status');
        const poloFilter = document.getElementById('filter-polo');
        const responsavelFilter = document.getElementById('filter-responsavel');
        
        const params = new URLSearchParams();
        if (statusFilter && statusFilter.value) params.append('status', statusFilter.value);
        if (poloFilter && poloFilter.value) params.append('polo', poloFilter.value);
        if (responsavelFilter && responsavelFilter.value) params.append('responsavel', responsavelFilter.value);
        if (searchInput && searchInput.value) params.append('search', searchInput.value.trim());

        try {
            const contatosFiltrados = await api.getContatos(params.toString());
            ui.renderContatosTabela(contatosFiltrados, tabelaContatosCorpo);
        } catch (error) {
            console.error("Erro ao buscar contatos filtrados:", error);
            tabelaContatosCorpo.innerHTML = `<tr><td colspan="6">Erro ao carregar contatos.</td></tr>`;
        }
    }

    // --- INICIALIZAÇÃO DOS DADOS ---
async function inicializarDados() {
    try {
        // 1. Pega o usuário do localStorage para saber a permissão
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        const isAdmin = user.role && user.role.toLowerCase() === 'admin';

        // 2. Monta a lista de requisições de forma condicional
        const promisesToRun = [
            api.getStatus(),
            api.getPolos()
        ];
        if (isAdmin) {
            promisesToRun.push(api.getAllUsers());
        }

        const results = await Promise.all(promisesToRun);

        // 3. Extrai os resultados
        const statuslist = results[0];
        const pololist = results[1];
        
        // As renderizações de status e polo continuam as mesmas
        if (selectStatusForm) ui.renderStatusOptions(statuslist, selectStatusForm);
        if (selectPoloForm) ui.renderPoloOptions(pololist, selectPoloForm);

        const editStatusSelect = document.getElementById('edit-status_id');
        const editPoloSelect = document.getElementById('edit-polo_id');
        if (editStatusSelect) ui.renderStatusOptions(statuslist, editStatusSelect);
        if (editPoloSelect) ui.renderPoloOptions(pololist, editPoloSelect);

        ui.renderStatusOptions(statuslist, document.getElementById('filter-status'), 'Todos os Status');
        ui.renderPoloOptions(pololist, document.getElementById('filter-polo'), 'Todos os Polos');

        // 4. Renderiza ou esconde o filtro de responsáveis
        const filtroResponsavel = document.getElementById('filter-responsavel');
        if (isAdmin) {
            const userlist = results[2]; // Pega a lista de usuários que só o admin recebeu
            ui.renderUserOptions(userlist, filtroResponsavel, 'Todos os Responsáveis');
        } else {
            // Se não for admin, esconde o filtro para não ficar um dropdown vazio
            if (filtroResponsavel && filtroResponsavel.parentElement) {
                filtroResponsavel.parentElement.style.display = 'none';
            }
        }
        
        await buscarErenderizarContatos();
        const contatosIniciais = await api.getContatos(); // Busca sem filtro para as notificações
       // verificarLembretesENotificar(contatosIniciais);

    } catch (error) {
        console.error("Erro ao inicializar a página:", error);
        alert(`Não foi possível carregar os dados do CRM. Erro: ${error.message}`);
    }
}
    
    // --- FUNÇÕES AUXILIARES E DE MODAL ---
    function renderChecklist(checklistData, isEditing) {
        const container = document.getElementById('documentos-checklist-container');
        if (!container) return;
        container.innerHTML = '';
        let dataObject;
        try {
            if (checklistData && typeof checklistData === 'object') dataObject = checklistData;
            else if (typeof checklistData === 'string' && checklistData.startsWith('{')) dataObject = JSON.parse(checklistData);
            else dataObject = {};
        } catch (e) {
            console.warn('Dado do checklist era inválido, usando objeto vazio como padrão.', checklistData);
            dataObject = {};
        }
        const nomesDocumentos = { rg: 'RG', cpf: 'CPF', historico_escolar: 'Histórico Escolar', comprovante_residencia: 'Comprov. de Residência' };
        for (const key in nomesDocumentos) {
            const div = document.createElement('div');
            div.className = 'checklist-item';
            const isChecked = dataObject[key] === true;
            if (isEditing) {
                div.innerHTML = `<input type="checkbox" id="check-${key}" name="${key}" ${isChecked ? 'checked' : ''}><label for="check-${key}">${nomesDocumentos[key]}</label>`;
            } else {
                const icon = isChecked ? '✅' : '❌';
                div.innerHTML = `<span>${icon} ${nomesDocumentos[key]}</span>`;
            }
            container.appendChild(div);
        }
    }

    function limparNumeroParaWhatsApp(numero) { if (!numero) return ''; return `55${String(numero).replace(/\D/g, '')}`; }
    function formatarParaInputLocal(date) { const year = date.getFullYear(); const month = (date.getMonth() + 1).toString().padStart(2, '0'); const day = date.getDate().toString().padStart(2, '0'); const hours = date.getHours().toString().padStart(2, '0'); const minutes = date.getMinutes().toString().padStart(2, '0'); return `${year}-${month}-${day}T${hours}:${minutes}`; }
    function formatarTelefone(numero) { if (!numero) return 'N/A'; const n = String(numero).replace(/\D/g, ''); if (n.length === 11) return n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); if (n.length === 10) return n.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); return numero; }
    function verificarLembretesEnotificar(contatos) { if (Notification.permission === 'default') Notification.requestPermission(); if (Notification.permission === 'granted') { const hoje = new Date(); contatos.forEach(c => { if (c.lembrete_ativo && new Date(c.lembrete_data) < hoje) { const id = `lembrete-notificado-${c.id}`; if (!localStorage.getItem(id)) { new Notification('CRM - Lembrete de Contato', { body: `Lembrete para: ${c.nome}\nDescrição: ${c.lembrete_descricao || 'Nenhuma descrição.'}` }); localStorage.setItem(id, 'true'); } } }); } }
    function formatarDataDisplay(dataString) { if (!dataString) return 'N/A'; const data = new Date(dataString); return new Date(data.valueOf() + data.getTimezoneOffset() * 60 * 1000).toLocaleDateString('pt-BR'); }
    
    function popularDetalhesModal(contato) {
        if (!contato) { console.error("Dados do contato não foram recebidos."); return; }
        const modalTitle = document.getElementById('detalhes-modal-title');
        if (modalTitle) modalTitle.textContent = `Detalhes de ${contato.nome}`;
        if (camposDetalhes.nome) camposDetalhes.nome.textContent = contato.nome || 'N/A';
        if (camposDetalhes.cpf) camposDetalhes.cpf.textContent = contato.cpf || 'N/A';
        if (camposDetalhes.rg) camposDetalhes.rg.textContent = contato.rg || 'N/A';
        if (camposDetalhes.data_nascimento) camposDetalhes.data_nascimento.textContent = formatarDataDisplay(contato.data_nascimento);
        if (camposDetalhes.email) camposDetalhes.email.textContent = contato.email || 'N/A';
        if (camposDetalhes.telefone) camposDetalhes.telefone.innerHTML = `<a href="https://wa.me/${limparNumeroParaWhatsApp(contato.telefone)}" target="_blank" class="whatsapp-link" title="Abrir no WhatsApp">${formatarTelefone(contato.telefone)}</a>`;
        if (camposDetalhes.polo) camposDetalhes.polo.textContent = contato.nome_polo || 'N/A';
        if (camposDetalhes.status) camposDetalhes.status.textContent = contato.status || 'N/A';
        if (camposDetalhes.curso_interesse) camposDetalhes.curso_interesse.textContent = contato.curso_interesse || 'N/A';
        if (camposDetalhes.canal_aquisicao) camposDetalhes.canal_aquisicao.textContent = contato.canal_aquisicao || 'N/A';
        if (camposDetalhes.cep) camposDetalhes.cep.textContent = contato.endereco_cep || 'N/A';
        if (camposDetalhes.rua) camposDetalhes.rua.textContent = contato.endereco_rua || 'N/A';
        if (camposDetalhes.numero) camposDetalhes.numero.textContent = contato.endereco_numero || 'N/A';
        if (camposDetalhes.bairro) camposDetalhes.bairro.textContent = contato.endereco_bairro || 'N/A';
        if (camposDetalhes.cidade) camposDetalhes.cidade.textContent = contato.endereco_cidade || 'N/A';
        if (camposDetalhes.estado) camposDetalhes.estado.textContent = contato.endereco_estado || 'N/A';
        renderChecklist(contato.documentos_checklist, false);
    }
    
    function preencherCamposDeEdicao(contato) {
        for (const key in camposEdit) {
            if (camposEdit.hasOwnProperty(key)) {
                if (key === 'data_nascimento' && contato[key]) {
                    camposEdit[key].value = contato[key].split('T')[0];
                } else {
                    camposEdit[key].value = contato[key] || '';
                }
            }
        }
    }
    
    function alternarModoEdicao(isEditing) {
        detalhesModalBody.classList.toggle('is-editing', isEditing);
        detalhesEditBtn.style.display = isEditing ? 'none' : 'block';
        detalhesHistoryBtn.style.display = isEditing ? 'none' : 'block';
        detalhesSaveBtn.style.display = isEditing ? 'block' : 'none';
        detalhesCancelBtn.style.display = isEditing ? 'block' : 'none';
        api.getContatoById(contatoAbertoId).then(contato => renderChecklist(contato.documentos_checklist, isEditing));
    }

    // --- LÓGICA DOS EVENT LISTENERS ---
    function setupEventListeners() {
        if (formAdicionarContato) {
            formAdicionarContato.addEventListener('submit', async (event) => {
                event.preventDefault();
                const form = event.target;
                const novoContato = { nome: form.nome.value, email: form.email.value, telefone: form.telefone.value, polo_id: form.polo_id.value, status_id: form.status_id.value, curso_interesse: form.curso_interesse.value, canal_aquisicao: form.canal_aquisicao.value };
                try {
                    await api.createContato(novoContato);
                    form.reset();
                    await buscarErenderizarContatos();
                } catch (error) { alert("Erro ao adicionar contato: " + error.message); console.error(error); }
            });
        }
        
        const searchInput = document.getElementById('search-input');
        const statusFilter = document.getElementById('filter-status');
        const poloFilter = document.getElementById('filter-polo');
        const responsavelFilter = document.getElementById('filter-responsavel');
        if (searchInput) searchInput.addEventListener('input', debounce(buscarErenderizarContatos, 500));
        if (statusFilter) statusFilter.addEventListener('change', buscarErenderizarContatos);
        if (poloFilter) poloFilter.addEventListener('change', buscarErenderizarContatos);
        if (responsavelFilter) responsavelFilter.addEventListener('change', buscarErenderizarContatos);

       const exportBtn = document.getElementById('export-csv-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                exportBtn.textContent = 'Gerando...';
                exportBtn.disabled = true;

                try {
                    const searchInput = document.getElementById('search-input');
                    const statusFilter = document.getElementById('filter-status');
                    const poloFilter = document.getElementById('filter-polo');
                    const responsavelFilter = document.getElementById('filter-responsavel');
                    
                    const params = new URLSearchParams();
                    if (statusFilter && statusFilter.value) params.append('status', statusFilter.value);
                    if (poloFilter && poloFilter.value) params.append('polo', poloFilter.value);
                    if (responsavelFilter && responsavelFilter.value) params.append('responsavel', responsavelFilter.value);
                    if (searchInput && searchInput.value) params.append('search', searchInput.value.trim());

                    // --- PEQUENA MUDANÇA NA LÓGICA DE MONTAGEM DA STRING ---
                    let queryString = params.toString();
                    if (queryString) {
                        queryString = `?${queryString}`; // Adiciona o '?' apenas se houver parâmetros
                    }
                    
                    // Chama a função da API que envia o token
                    const response = await api.exportContatosCSVRequest(queryString);

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'relatorio_contatos.csv';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                } catch (error) {
                    console.error('Erro ao exportar CSV:', error);
                    alert('Falha ao gerar o relatório. Tente novamente.');
                } finally {
                    exportBtn.textContent = 'Exportar para CSV';
                    exportBtn.disabled = false;
                }
            });
        }

        tabelaContatosCorpo.addEventListener('click', async (event) => {
            const target = event.target;
            const linha = target.closest('tr');
            if (!linha) return;
            contatoAbertoId = linha.dataset.id; 
            
            if (target.classList.contains('contact-name') || target.classList.contains('edit-btn')) {
                const isEditMode = target.classList.contains('edit-btn');
                try {
                    const contatoDetalhes = await api.getContatoById(contatoAbertoId);
                    popularDetalhesModal(contatoDetalhes);
                    preencherCamposDeEdicao(contatoDetalhes);
                    alternarModoEdicao(isEditMode);
                    ui.mostrarDetalhesModal();
                } catch (error) { console.error("Erro ao abrir detalhes:", error); alert('Não foi possível carregar os detalhes.'); }
            }
            if (target.classList.contains('delete-btn')) {
                if (confirm('Tem certeza que deseja excluir este contato?')) {
                    try { await api.deleteContato(contatoAbertoId); await buscarErenderizarContatos(); } 
                    catch (error) { alert("Erro ao excluir contato."); console.error(error); }
                }
            }
            if (target.classList.contains('lembrete-btn')) {
                contatoIdParaLembrete = linha.dataset.id;
                const { contactName, lembreteData, lembreteDescricao } = target.dataset;
                ui.mostrarModalLembrete(contactName);
                const isAtivo = target.classList.contains('lembrete-ativo');
                lembreteModoInput.value = isAtivo ? 'editar' : 'criar';
                salvarLembreteBtn.textContent = isAtivo ? 'Atualizar Lembrete' : 'Salvar Lembrete';
                removerLembreteBtn.style.display = isAtivo ? 'block' : 'none';
                lembreteDatetimeInput.value = isAtivo ? formatarParaInputLocal(new Date(lembreteData)) : '';
                lembreteDescricaoInput.value = isAtivo ? lembreteDescricao : '';
            }
        });

        if(passwordModalCloseBtn) passwordModalCloseBtn.addEventListener('click', ui.esconderModalSenha);
        if(passwordModal) passwordModal.addEventListener('click', (e) => { if (e.target === passwordModal) ui.esconderModalSenha(); });
        if(changePasswordForm) changePasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            passwordErrorMessage.style.display = 'none';
            const senhaAtual = document.getElementById('senha-atual').value;
            const novaSenha = document.getElementById('nova-senha').value;
            try {
                const data = await api.mudarSenha({ senhaAtual, novaSenha });
                alert(data.message);
                changePasswordForm.reset();
                ui.esconderModalSenha();
            } catch (error) { passwordErrorMessage.textContent = error.message; passwordErrorMessage.style.display = 'block'; }
        });
        
        if(detalhesModalBody) detalhesModalBody.addEventListener('click', async (event) => {
            if (event.target.classList.contains('btn-interacao')) {
                const descricaoInput = document.getElementById('interacao-descricao');
                const descricao = descricaoInput.value.trim();
                const tipo_acao = event.target.dataset.tipo;
                if (!descricao) {
                    alert('Por favor, preencha a descrição da interação.');
                    descricaoInput.focus();
                    return;
                }
                try {
                    const historicoAtualizado = await api.registrarInteracaoManual(contatoAbertoId, { descricao, tipo_acao });
                    descricaoInput.value = '';
                    const nomeContato = camposDetalhes.nome.textContent;
                    ui.renderHistoricoModal(historicoAtualizado, nomeContato);
                    alert(`Interação do tipo "${tipo_acao}" registrada com sucesso!`);
                } catch (error) {
                    alert(`Erro ao registrar a interação: ${error.message}`);
                }
            }
        });

        if(presetButtons) presetButtons.forEach(button => { button.addEventListener('click', () => { const days = parseInt(button.dataset.days, 10); const d = new Date(); d.setDate(d.getDate() + days); lembreteDatetimeInput.value = formatarParaInputLocal(d); }); });
        if(salvarLembreteBtn) salvarLembreteBtn.addEventListener('click', async () => { const dataLocal = lembreteDatetimeInput.value, desc = lembreteDescricaoInput.value; if (!contatoIdParaLembrete || !dataLocal) return alert('Selecione uma data e hora.'); try { const dataUTC = new Date(dataLocal).toISOString(); await api.agendarLembrete(contatoIdParaLembrete, {dataLembrete: dataUTC, lembreteDescricao: desc}); await buscarErenderizarContatos(); ui.esconderModalLembrete(); alert(`Lembrete agendado!`); } catch (error) { alert('Erro ao salvar o lembrete.'); } });
        if(removerLembreteBtn) removerLembreteBtn.addEventListener('click', async () => { if (confirm('Remover este lembrete?')) { try { await api.removerLembrete(contatoIdParaLembrete); await buscarErenderizarContatos(); ui.esconderModalLembrete(); } catch (error) { alert('Erro ao remover o lembrete.'); } } });
        
        if(detalhesModalCloseBtn) detalhesModalCloseBtn.addEventListener('click', ui.esconderDetalhesModal);
        if(detalhesModal) detalhesModal.addEventListener('click', (e) => { if (e.target === detalhesModal) ui.esconderDetalhesModal(); });
        if(detalhesEditBtn) detalhesEditBtn.addEventListener('click', () => alternarModoEdicao(true));
        if(detalhesCancelBtn) detalhesCancelBtn.addEventListener('click', () => alternarModoEdicao(false));
        
        if(detalhesHistoryBtn) detalhesHistoryBtn.addEventListener('click', async () => {
            try {
                const nomeContato = camposDetalhes.nome.textContent;
                ui.esconderDetalhesModal(); 
                ui.renderHistoricoModal([], nomeContato);
                ui.mostrarModal(); 
                const historico = await api.getHistorico(contatoAbertoId);
                ui.renderHistoricoModal(historico, nomeContato);
            } catch (error) { alert("Não foi possível carregar o histórico."); }
        });
        
        if(detalhesSaveBtn) detalhesSaveBtn.addEventListener('click', async () => {
            const dadosAtualizados = {};
            for (const key in camposEdit) {
                if (camposEdit.hasOwnProperty(key)) dadosAtualizados[key] = camposEdit[key].value;
            }
            const checklistData = {};
            document.querySelectorAll('#documentos-checklist-container input[type="checkbox"]').forEach(c => checklistData[c.name] = c.checked);
            dadosAtualizados.documentos_checklist = checklistData;
            try {
                await api.updateContato(contatoAbertoId, dadosAtualizados);
                const contatoDetalhes = await api.getContatoById(contatoAbertoId);
                popularDetalhesModal(contatoDetalhes);
                alternarModoEdicao(false);
                await buscarErenderizarContatos();
                alert('Contato atualizado com sucesso!');
            } catch (error) {
                alert('Erro ao salvar as alterações: ' + error.message);
            }
        });

        if(historyModalCloseBtn) historyModalCloseBtn.addEventListener('click', ui.esconderModal);
        if(historyModal) historyModal.addEventListener('click', (e) => { if (e.target === historyModal) ui.esconderModal(); });
        if(lembreteModalCloseBtn) lembreteModalCloseBtn.addEventListener('click', ui.esconderModalLembrete);
        if(lembreteModal) lembreteModal.addEventListener('click', (e) => { if (e.target === lembreteModal) ui.esconderModalLembrete(); });
    }

    // --- CHAMADAS FINAIS ---
    inicializarDados();
    setupEventListeners();
});