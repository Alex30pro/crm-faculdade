const API_BASE_URL = '/api';

let todosStatus = []; 

async function carregarStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        todosStatus = await response.json(); 
        
        const selectStatus = document.getElementById('status_id');
        selectStatus.innerHTML = '<option value="" disabled selected>Selecione um status...</option>'; 
        todosStatus.forEach(status => {
            const option = document.createElement('option');
            option.value = status.id;
            option.textContent = status.nome_status;
            selectStatus.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar status:", error);
    }
}

async function carregarContatos() {
    try {
        const response = await fetch(`${API_BASE_URL}/contatos`);
        const contatos = await response.json();

        const tabelaCorpo = document.querySelector("#contacts-table tbody");
        tabelaCorpo.innerHTML = '';

        contatos.forEach(contato => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', contato.id); 
            tr.innerHTML = `
                <td>${contato.nome}</td>
                <td>${contato.email || ''}</td>
                <td>${contato.telefone || ''}</td>
                <td>
                    <span class="status-tag" style="background-color: ${contato.status_cor};">
                        ${contato.status}
                    </span>
                </td>
                <td class="actions">
                    <button class="edit-btn" onclick="editarContato(${contato.id})">Editar</button>
                    <button class="delete-btn" onclick="deletarContato(${contato.id})">Excluir</button>
                </td>
            `;
            tabelaCorpo.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar contatos:", error);
    }
}

async function deletarContato(id) {

    if (!confirm('Tem certeza que deseja excluir este contato?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/contatos/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            carregarContatos(); 
        } else {
            alert("Erro ao excluir contato.");
        }
    } catch (error) {
        console.error("Erro na requisição de exclusão:", error);
    }
}

function editarContato(id) {
    const linha = document.querySelector(`tr[data-id='${id}']`);
    const celulas = linha.querySelectorAll('td');

    const nomeAtual = celulas[0].innerText;
    const emailAtual = celulas[1].innerText;
    const telefoneAtual = celulas[2].innerText;
    
    celulas[0].innerHTML = `<input type="text" class="edit-input" value="${nomeAtual}">`;
    celulas[1].innerHTML = `<input type="email" class="edit-input" value="${emailAtual}">`;
    celulas[2].innerHTML = `<input type="tel" class="edit-input" value="${telefoneAtual}">`;

    let statusSelectHTML = `<select class="edit-select">`;
    todosStatus.forEach(status => {
        statusSelectHTML += `<option value="${status.id}">${status.nome_status}</option>`;
    });
    statusSelectHTML += `</select>`;
    celulas[3].innerHTML = statusSelectHTML;

    celulas[4].innerHTML = `
        <button class="save-btn" onclick="salvarEdicao(${id})">Salvar</button>
        <button class="cancel-btn" onclick="carregarContatos()">Cancelar</button>
    `;
}

async function salvarEdicao(id) {
    const linha = document.querySelector(`tr[data-id='${id}']`);
    
    const dadosAtualizados = {
        nome: linha.querySelector('td:nth-child(1) input').value,
        email: linha.querySelector('td:nth-child(2) input').value,
        telefone: linha.querySelector('td:nth-child(3) input').value,
        status_id: linha.querySelector('td:nth-child(4) select').value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/contatos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados),
        });

        if (response.ok) {
            carregarContatos(); 
        } else {
            alert("Erro ao salvar alterações.");
        }
    } catch (error) {
        console.error("Erro na requisição de atualização:", error);
    }
}

async function adicionarContato(event) {
    event.preventDefault();
    const form = event.target;
    const novoContato = {
        nome: form.nome.value,
        email: form.email.value,
        telefone: form.telefone.value,
        status_id: form.status_id.value,
    };
    try {
        const response = await fetch(`${API_BASE_URL}/contatos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoContato),
        });
        if (response.ok) {
            form.reset();
            document.getElementById('status_id').selectedIndex = 0; 
            carregarContatos();
        } else {
            alert("Erro ao adicionar contato.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarStatus();
    carregarContatos();
    document.getElementById('add-contact-form').addEventListener('submit', adicionarContato);
});
