// client/js/modules/ui.js (VERSÃO CORRIGIDA E MAIS ROBUSTA)

// --- Funções Auxiliares Internas ---
function limparNumeroParaWhatsApp(numero) {
    if (!numero) return '';
    const numeroLimpo = String(numero).replace(/\D/g, '');
    return `55${numeroLimpo}`;
}

function formatarTelefone(numero) {
    if (!numero) return 'N/A';
    const numeroLimpo = String(numero).replace(/\D/g, '');
    if (numeroLimpo.length === 11) return numeroLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (numeroLimpo.length === 10) return numeroLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return numero;
}

function formatarData(dataISO) {
    if (!dataISO) return '';

    const dataUTC = new Date(dataISO.replace(' ', 'T') + 'Z');

    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        timeZone: 'America/Sao_Paulo' 
    };

    return dataUTC.toLocaleString('pt-BR', options);
}

// --- Funções Exportadas ---

export function renderStatusOptions(statusList, selectElement, defaultText = 'Selecione um status...') {
    if(!selectElement) return;
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    statusList.forEach(status => {
        const option = document.createElement('option');
        option.value = status.id;
        option.textContent = status.nome_status;
        selectElement.appendChild(option);
    });
}

export function renderPoloOptions(poloList, selectElement, defaultText = 'Selecione um polo...') {
    if(!selectElement) return;
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    poloList.forEach(polo => {
        const option = document.createElement('option');
        option.value = polo.id;
        option.textContent = polo.nome_polo;
        selectElement.appendChild(option);
    });
}

export function renderUserOptions(userList, selectElement, defaultText = 'Selecione um responsável...') {
    if (!selectElement) return;
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    userList.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.nome;
        selectElement.appendChild(option);
    });
}

export function renderContatosTabela(contatos, tabelaCorpo) {
    tabelaCorpo.innerHTML = '';
    if (contatos.length === 0) {
        tabelaCorpo.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhum contato encontrado.</td></tr>`;
        return;
    }
    contatos.forEach(contato => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', contato.id);
        const isAtivo = contato.lembrete_ativo;
        const isVencido = isAtivo && new Date(contato.lembrete_data) < new Date();
        if (isVencido) tr.classList.add('lembrete-vencido-linha');

        let lembreteIcon = '';
        if (contato.status === 'Pendente' || contato.status === 'Em Negociação') {
            let classes = 'lembrete-btn';
            if (isAtivo) classes += ' lembrete-ativo';
            if (isVencido) classes += ' lembrete-vencido';
            lembreteIcon = `<button class="${classes}" title="Agendar lembrete" data-contact-name="${contato.nome}" data-lembrete-data="${contato.lembrete_data || ''}" data-lembrete-descricao="${contato.lembrete_descricao || ''}">⏰</button>`;
        }

        tr.innerHTML = `
            <td class="contact-name">${contato.nome}</td>
            <td>${contato.nome_polo || 'N/A'}</td>
            <td>${contato.email || ''}</td>
            <td><a href="https://wa.me/${limparNumeroParaWhatsApp(contato.telefone)}" target="_blank" class="whatsapp-link" title="Abrir no WhatsApp">${formatarTelefone(contato.telefone)}</a></td>
            <td><div class="status-cell"><span class="status-tag" style="background-color: ${contato.status_cor};">${contato.status}</span>${lembreteIcon}</div></td>
            <td class="actions"><div class="actions-wrapper"><button class="edit-btn">Editar</button><button class="delete-btn">Excluir</button></div></td>
        `;
        tabelaCorpo.appendChild(tr);
    });
}

// --- Funções de Modal (com a correção de timing) ---

function mostrarModalGenerico(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = 1;
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    }
}

function esconderModalGenerico(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.opacity = 0;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Histórico
export const mostrarModal = () => mostrarModalGenerico('history-modal');
export const esconderModal = () => esconderModalGenerico('history-modal');
export function renderHistoricoModal(historico, nomeContato) {
    const modalTitle = document.getElementById('modal-title');
    const historyModalBody = document.getElementById('modal-body');
    if (modalTitle) modalTitle.innerText = `Histórico de ${nomeContato}`;
    if (!historyModalBody) return;

    historyModalBody.innerHTML = '';
    if (historico.length === 0) {
        historyModalBody.innerHTML = '<p>Nenhum histórico encontrado para este contato.</p>';
        return;
    }
    const ul = document.createElement('ul');
    ul.className = 'history-list';
    historico.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `<p>${item.descricao}</p><div class="meta"><span>Por: <strong>${item.nome_usuario}</strong></span> | <span>Em: ${formatarData(item.created_at)}</span></div>`;
        ul.appendChild(li);
    });
    historyModalBody.appendChild(ul);
}

// Senha
export const mostrarModalSenha = () => mostrarModalGenerico('password-modal');
export const esconderModalSenha = () => esconderModalGenerico('password-modal');

// Lembrete
export const mostrarModalLembrete = (nomeContato) => {
    const title = document.getElementById('lembrete-modal-title');
    if (title) title.textContent = `Agendar Lembrete para ${nomeContato}`;
    mostrarModalGenerico('lembrete-modal');
};
export const esconderModalLembrete = () => esconderModalGenerico('lembrete-modal');

// Detalhes
export const mostrarDetalhesModal = () => mostrarModalGenerico('detalhes-modal');
export const esconderDetalhesModal = () => esconderModalGenerico('detalhes-modal');