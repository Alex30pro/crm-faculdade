// client/js/auth.js (VERSÃO CORRIGIDA E COMPLETA)

// A verificação de segurança deve ser baseada no TOKEN, que é a prova de login.
const token = localStorage.getItem('authToken');

// Verifica em qual página o script está rodando.
const onLoginPage = window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/');

// REGRA 1: Se o usuário TEM um token e está na página de login, mande-o para o dashboard.
if (token && onLoginPage) {
    window.location.href = 'dashboard.html';
}

// REGRA 2: Se o usuário NÃO TEM um token e NÃO está na página de login, mande-o para o login.
if (!token && !onLoginPage) {
    window.location.href = 'index.html';
}