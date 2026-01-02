import * as api from './modules/api.js';
import * as ui from './modules/ui.js';
import { renderHeader } from './modules/header.js';

document.addEventListener('DOMContentLoaded', () => {
    renderHeader(); 

    const authToken = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!authToken || !user) {
        window.location.href = 'index.html';
        return; 
    }
    
    const tabelaCorpo = document.querySelector("#lixeira-table tbody");
    const changePasswordForm = document.getElementById('change-password-form'); 
    const passwordErrorMessage = document.getElementById('password-error-message');

    async function carregarLixeira() {
        try {
            const contatosDeletados = await api.getLixeira();
            tabelaCorpo.innerHTML = '';
            if (contatosDeletados.length === 0) {
                tabelaCorpo.innerHTML = '<tr><td colspan="5" style="text-align:center;">A lixeira está vazia.</td></tr>';
                return;
            }
            contatosDeletados.forEach(contato => {
                const tr = document.createElement('tr');
                tr.dataset.id = contato.id;

                    let acoesHtml = `<button class="btn btn-secondary" data-action="restore">Restaurar</button>`;
                    if (user.role.toLowerCase() === 'admin') {
                        acoesHtml += ` <button class="btn btn-danger" data-action="delete-permanent">Excluir Permanente</button>`;
                    }

                tr.innerHTML = `
                    <td>${contato.nome}</td>
                    <td>${contato.email || ''}</td>
                    <td>${new Date(contato.deletado_em).toLocaleString('pt-BR')}</td>
                    <td>${contato.excluido_por || 'N/A'}</td>
                    <td class="actions">
                        <div class="actions-wrapper">
                            ${acoesHtml}
                        </div>
                    </td>
                `;
                tabelaCorpo.appendChild(tr);
            });
        } catch (error) {
            console.error("Erro ao carregar lixeira:", error);
            tabelaCorpo.innerHTML = `<tr><td colspan="5" style="text-align:center;">Erro ao carregar dados: ${error.message}</td></tr>`;
        }
    }

    function setupEventListeners() {
        
      tabelaCorpo.addEventListener('click', async (event) => {
            
            const targetButton = event.target.closest('button');
            if (!targetButton) return; 

            const action = targetButton.dataset.action; 
            const id = targetButton.closest('tr').dataset.id; 

            if (action === 'restore') {
                if (confirm('Tem certeza que deseja restaurar este contato?')) {
                    try {
                        await api.restaurarContato(id);
                        carregarLixeira(); 
                    } catch (error) {
                        alert(`Erro ao restaurar o contato: ${error.message}`);
                    }
                }
            }

            if (action === 'delete-permanent') {
                if (confirm('ATENÇÃO: Ação irreversível!\n\nDeseja realmente excluir este contato PERMANENTEMENTE do sistema?')) {
                    try {
                        await api.deletePermanente(id);
                        alert('Contato excluído permanentemente.');
                        carregarLixeira(); 
                    } catch (error) {
                        alert(`Erro ao excluir permanentemente: ${error.message}`);
                    }
                }
            }
        });
    }

    carregarLixeira();
    setupEventListeners();
});
