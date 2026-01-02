const token = localStorage.getItem('authToken');

const onLoginPage = window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/');

if (token && onLoginPage) {
    window.location.href = 'dashboard.html';
}

if (!token && !onLoginPage) {
    window.location.href = 'index.html';
}
