import * as api from './modules/api.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmar-senha');
    const errorMessage = document.getElementById('error-message');
    const toggleButtons = document.querySelectorAll('.password-toggle-btn');

    // Lógica para mostrar/ocultar senha
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const passwordInput = btn.previousElementSibling;
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
            } else {
                passwordInput.type = 'password';
            }
        });
    });

    // Lógica do formulário de cadastro
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.style.display = 'none';

        const nome = nomeInput.value;
        const email = emailInput.value;
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        if (senha !== confirmarSenha) {
            errorMessage.textContent = 'As senhas não coincidem.';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            const response = await api.registerUser({ nome, email, senha });
            alert(response.message);
            window.location.href = 'index.html';
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
});