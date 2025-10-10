// client/js/login.js

console.log(">>>> O ARQUIVO login.js FOI CARREGADO! <<<<");

import * as api from './modules/api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DOS ELEMENTOS ---
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('error-message');
    const toggleBtn = document.querySelector('.password-toggle-btn');

    // --- LÓGICA PARA MOSTRAR/OCULTAR SENHA ---
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (senhaInput.type === 'password') {
                senhaInput.type = 'text';
            } else {
                senhaInput.type = 'password';
            }
        });
    }

    // --- LÓGICA DO FORMULÁRIO DE LOGIN ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        errorMessage.style.display = 'none';

        const email = emailInput.value;
        const senha = senhaInput.value;

        try {
            const data = await api.login({ email, senha });

            localStorage.setItem('authToken', data.token);

            localStorage.setItem('user', JSON.stringify(data.usuario));

            window.location.href = 'dashboard.html';

        } catch (error) {
            // Este bloco não deve ser executado se o login deu certo.
            console.error("ERRO NO BLOCO CATCH:", error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
});