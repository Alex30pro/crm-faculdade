import * as api from './modules/api.js';
import { renderHeader } from './modules/header.js';

document.addEventListener('DOMContentLoaded', () => {
    renderHeader(); 

    const user = JSON.parse(localStorage.getItem('user'));

    if (!localStorage.getItem('authToken') || !user || user.role.toLowerCase() !== 'admin') {
        alert('Acesso negado. Apenas administradores podem ver esta página.');
        window.location.href = 'dashboard.html';
        return; 
    }

    const tabelaCorpo = document.querySelector('#users-table tbody');
    
    const addUserModal = document.getElementById('add-user-modal');
    const addUserBtn = document.getElementById('add-user-btn');
    const closeModalBtn = document.getElementById('add-user-modal-close-btn');
    const addUserForm = document.getElementById('add-user-form');
    const errorMessage = document.getElementById('add-user-error-message');

    async function carregarUsuarios() {
        try {
            const usuarios = await api.getAllUsers();
            tabelaCorpo.innerHTML = '';
            
            usuarios.forEach(u => {
                const tr = document.createElement('tr');
                tr.dataset.id = u.id;

                const isAdmin = u.role.toLowerCase() === 'admin';
                const isCurrentUser = u.id === user.id;
                const statusClass = u.is_active ? 'status-ativo' : 'status-inativo';
                const statusText = u.is_active ? 'Ativo' : 'Inativo';
                const toggleActionText = u.is_active ? 'Desativar' : 'Reativar';

                const promoteButton = !isAdmin
                    ? `<button class="btn btn-secondary" data-action="promote">Promover a Admin</button>`
                    : '';

                const toggleButton = `<button class="btn btn-secondary" data-action="toggle-status" ${isCurrentUser ? 'disabled' : ''}>${toggleActionText}</button>`;

                tr.innerHTML = `
                    <td>${u.nome}</td>
                    <td>${u.email}</td>
                    <td>${isAdmin ? 'Admin' : 'Usuário'}</td>
                    <td><span class="status-tag ${statusClass}">${statusText}</span></td>
                    <td class="actions">
                        <div class="actions-wrapper">
                            ${toggleButton}
                            ${promoteButton}
                        </div>
                    </td>
                `;
                tabelaCorpo.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            tabelaCorpo.innerHTML = `<tr><td colspan="5">Erro ao carregar usuários: ${error.message}</td></tr>`;
        }
    }

    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            addUserForm.reset();
            errorMessage.textContent = '';
            addUserModal.style.display = 'flex';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            addUserModal.style.display = 'none';
        });
    }

    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.textContent = '';

            const nome = document.getElementById('add-user-nome').value;
            const email = document.getElementById('add-user-email').value;
            const senha = document.getElementById('add-user-senha').value;
            const role = document.getElementById('add-user-role').value;

            try {
                await api.register({ nome, email, senha, role });
                alert('Usuário criado com sucesso!');
                addUserForm.reset();
                addUserModal.style.display = 'none';
                carregarUsuarios();
            } catch (error) {
                errorMessage.textContent = error.message;
            }
        });
    }

    tabelaCorpo.addEventListener('click', async (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;

        const action = targetButton.dataset.action;
        const userId = targetButton.closest('tr').dataset.id;
        if (!action || !userId) return;

        if (action === 'toggle-status') {
            const isActive = tabelaCorpo.querySelector(`tr[data-id="${userId}"] .status-tag`).classList.contains('status-ativo');
            const actionText = isActive ? 'desativar' : 'reativar';
            if (confirm(`Tem certeza que deseja ${actionText} este usuário?`)) {
                try {
                    await api.toggleUserStatus(userId, !isActive);
                    carregarUsuarios();
                } catch(error) {
                    alert(`Erro ao atualizar status: ${error.message}`);
                }
            }
        }

        if (action === 'promote') {
            if (confirm('Tem certeza que deseja promover este usuário a Administrador? Ele terá acesso total ao sistema.')) {
                try {
                    await api.updateUserRole(userId, 'admin'); 
                    carregarUsuarios();
                } catch (error) {
                    alert(`Erro ao promover usuário: ${error.message}`);
                }
            }
        }
    });

    carregarUsuarios();
});
