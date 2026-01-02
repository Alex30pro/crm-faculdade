export function renderHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const mainHeader = document.querySelector('.main-header');
    if (!mainHeader) return;

    const currentPage = window.location.pathname.split('/').pop();
    const isDashboardPage = (currentPage === 'dashboard.html' || currentPage === '');

    if (isDashboardPage) {
        if (!document.getElementById('password-modal')) {
            const modalHtml = `
                <div id="password-modal" class="modal">
                    <div class="modal-content">
                        <header class="modal-header">
                            <h2>Mudar Senha</h2>
                            <button id="password-modal-close-btn" class="modal-close-btn">&times;</button>
                        </header>
                        <div class="modal-body">
                            <form id="change-password-form">
                                <div class="form-group"><label for="senha-atual">Senha Atual</label><input type="password" id="senha-atual" required></div>
                                <div class="form-group"><label for="nova-senha">Nova Senha</label><input type="password" id="nova-senha" required></div>
                                <button type="submit" class="btn btn-primary">Salvar Nova Senha</button>
                                <p id="password-error-message" class="error-message"></p>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        const passwordModal = document.getElementById('password-modal');
        const closeBtn = document.getElementById('password-modal-close-btn');
        const changePasswordForm = document.getElementById('change-password-form');
        const passwordErrorMessage = document.getElementById('password-error-message');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (passwordModal) passwordModal.style.display = 'none';
            });
        }
        
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                if (passwordErrorMessage) passwordErrorMessage.textContent = '';
                try {
                    const response = await fetch('/api/auth/mudar-senha', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                        body: JSON.stringify({
                            senhaAtual: document.getElementById('senha-atual').value,
                            novaSenha: document.getElementById('nova-senha').value
                        })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    
                    passwordErrorMessage.textContent = data.message;
                    passwordErrorMessage.classList.add('success');
                    setTimeout(() => {
                        if (passwordModal) passwordModal.style.display = 'none';
                        passwordErrorMessage.textContent = '';
                        passwordErrorMessage.classList.remove('success');
                    }, 2000);
                } catch (error) {
                    if (passwordErrorMessage) {
                        passwordErrorMessage.textContent = error.message;
                        passwordErrorMessage.classList.add('error');
                    }
                }
            });
        }
    }

    let adminLinks = '';
    if (user.role.toLowerCase() === 'admin') {
        adminLinks = `
            <a href="usuarios.html" class="nav-link ${currentPage === 'usuarios.html' ? 'active' : ''}">Gerenciar Usuários</a>
            <a href="relatorios.html" class="nav-link ${currentPage === 'relatorios.html' ? 'active' : ''}">Relatórios</a>
        `;
    }
    
    let changePasswordLinkHtml = '';
    if (isDashboardPage) {
        changePasswordLinkHtml = `<li><a href="#" id="change-password-link">Mudar Senha</a></li>`;
    }

    mainHeader.innerHTML = `
        <div class="header-content">
            <div class="header-logo"><h3>ConnectaCRM</h3></div>
            <nav class="main-nav">
                <a href="dashboard.html" class="nav-link ${currentPage === 'dashboard.html' ? 'active' : ''}">Painel de Alunos</a>
                <a href="lixeira.html" class="nav-link ${currentPage === 'lixeira.html' ? 'active' : ''}">Lixeira</a>
                <a href="kanban.html" class="nav-link ${currentPage === 'kanban.html' ? 'active' : ''}">Kanban</a>
                ${adminLinks}
            </nav>
            <div class="user-menu">
                <button id="theme-toggle-btn" class="theme-toggle" title="Mudar tema">🌙</button>
                <div class="user-profile-menu">
                    <div class="avatar"><span id="user-initial">${user.nome.charAt(0).toUpperCase()}</span></div>
                    <span id="user-name">${user.nome}</span>
                    <ul class="dropdown-menu">
                        ${changePasswordLinkHtml}
                        <li><a href="#" id="logout-btn">Sair</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    const changePasswordLink = document.getElementById('change-password-link');
    if (changePasswordLink) {
        changePasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            const passwordModal = document.getElementById('password-modal');
            if (passwordModal) passwordModal.style.display = 'flex';
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }


    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        function applyTheme(theme) {
            document.body.classList.remove('light-theme', 'dark-theme');
            document.body.classList.add(`${theme}-theme`);
            themeToggleBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
            localStorage.setItem('theme', theme);
        }

        const currentTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(currentTheme);

        themeToggleBtn.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    } 
}
