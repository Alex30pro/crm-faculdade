// EM: client/js/login.js (VERSÃO FINAL SEM DOMCONTENTLOADED)

console.log(">>>> O ARQUIVO login.js FOI CARREGADO! <<<<");
import * as api from './modules/api.js';

// --- SELETORES DOS ELEMENTOS ---
// O código agora roda diretamente, sem o 'wrapper' do evento.
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const errorMessage = document.getElementById('error-message');
const toggleBtn = document.querySelector('.password-toggle-btn');

// --- LÓGICA PARA MOSTRAR/OCULTAR SENHA ---
if (toggleBtn && senhaInput) {
    toggleBtn.addEventListener('click', () => {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
        } else {
            senhaInput.type = 'password';
        }
    });
}

// --- LÓGICA DE SUBMISSÃO DO FORMULÁRIO ---
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Agora esta linha será executada!

        errorMessage.textContent = '';
        errorMessage.style.display = 'none';

        const email = emailInput.value;
        const senha = senhaInput.value;

        try {
            const data = await api.login({ email, senha });
            
            // Salva o token e os dados do usuário
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            
            // Redireciona para o dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error("ERRO NO LOGIN:", error);
            // Mostra a mensagem de erro que vem da nossa API
            errorMessage.textContent = error.message || 'Ocorreu um erro na requisição.';
            errorMessage.style.display = 'block';
        }
    });
} else {
    console.error("ERRO CRÍTICO: Não foi possível encontrar o elemento <form id='login-form'> na sua página index.html!");
}