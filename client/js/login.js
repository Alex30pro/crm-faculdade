console.log(">>>> O ARQUIVO login.js FOI CARREGADO! <<<<");
import * as api from './modules/api.js';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const errorMessage = document.getElementById('error-message');
const toggleBtn = document.querySelector('.password-toggle-btn');

if (toggleBtn && senhaInput) {
    toggleBtn.addEventListener('click', () => {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
        } else {
            senhaInput.type = 'password';
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        errorMessage.textContent = '';
        errorMessage.style.display = 'none';

        const email = emailInput.value;
        const senha = senhaInput.value;

        try {
            const data = await api.login({ email, senha });
            
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error("ERRO NO LOGIN:", error);
            errorMessage.textContent = error.message || 'Ocorreu um erro na requisição.';
            errorMessage.style.display = 'block';
        }
    });
} else {
    console.error("ERRO CRÍTICO: Não foi possível encontrar o elemento <form id='login-form'> na sua página index.html!");
}
