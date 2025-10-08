// client/js/kanban.js

import * as api from './modules/api.js';
import { renderHeader } from './modules/header.js';

document.addEventListener('DOMContentLoaded', () => {
    renderHeader(); // Perfeito! O cabeçalho é a primeira coisa a ser renderizada.

    // --- LÓGICA DE AUTENTICAÇÃO E SEGURANÇA ---
    const authToken = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!authToken || !user) {
        window.location.href = 'index.html';
        return;
    }

    // --- SELETORES E VARIÁVEIS ---
    const kanbanBoard = document.getElementById('kanban-board');

    // --- FUNÇÃO PRINCIPAL PARA INICIALIZAR O KANBAN ---
    async function inicializarKanban() {
        if (!kanbanBoard) return;
        kanbanBoard.innerHTML = '<p>Carregando quadro...</p>';

        try {
            const [statusList, contatos] = await Promise.all([
                api.getStatus(),
                api.getContatos()
            ]);

            kanbanBoard.innerHTML = '';

            // Renderiza as colunas
            statusList.forEach(status => {
                const column = document.createElement('div');
                column.className = 'kanban-column';
                column.dataset.statusId = status.id;

                column.innerHTML = `
                    <div class="kanban-column-header">
                        <span>${status.nome_status}</span>
                        <span class="card-count" id="count-${status.id}">0</span>
                    </div>
                    <div class="kanban-column-content"></div>
                `;
                kanbanBoard.appendChild(column);
            });

            // Renderiza os cartões
            contatos.forEach(contato => {
                const card = document.createElement('div');
                card.className = 'kanban-card';
                card.dataset.contactId = contato.id;

                card.innerHTML = `
                    <div class="card-title">${contato.nome}</div>
                    <div class="card-info">
                        <span>${contato.curso_interesse || 'Sem curso definido'}</span>
                        <span>${contato.email}</span>
                    </div>
                `;

                const correctColumnContent = kanbanBoard.querySelector(`.kanban-column[data-status-id='${contato.status_id}'] .kanban-column-content`);
                if (correctColumnContent) {
                    correctColumnContent.appendChild(card);
                }
            });

            updateCardCounts();

            // Ativa o "arrastar e soltar"
            const columnsContent = document.querySelectorAll('.kanban-column-content');
            columnsContent.forEach(column => {
                new Sortable(column, {
                    group: 'kanban-cards',
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    onEnd: handleCardMove
                });
            });

        } catch (error) {
            console.error("Erro ao inicializar o Kanban:", error);
            kanbanBoard.innerHTML = '<p>Erro ao carregar o quadro. Tente recarregar a página.</p>';
        }
    }

    // --- FUNÇÕES AUXILIARES ---
    async function handleCardMove(event) {
        const contatoId = event.item.dataset.contactId;
        const novoStatusId = event.to.parentElement.dataset.statusId;
        const antigoStatusId = event.from.parentElement.dataset.statusId;

        if (novoStatusId !== antigoStatusId) {
            try {
                await api.updateContato(contatoId, { status_id: novoStatusId });
                console.log(`Contato ${contatoId} movido para o status ${novoStatusId}`);
            } catch (error) {
                alert('Erro ao atualizar o status do contato. O quadro será recarregado.');
                console.error("Erro ao mover cartão:", error);
                location.reload(); 
            }
        }
        
        updateCardCounts();
    }

    function updateCardCounts() {
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(column => {
            const statusId = column.dataset.statusId;
            const cardCount = column.querySelectorAll('.kanban-card').length;
            const countElement = column.querySelector(`#count-${statusId}`);
            if (countElement) {
                countElement.textContent = cardCount;
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    inicializarKanban();
});