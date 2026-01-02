const API_BASE_URL = '/api';

function handleAuthError() {

    localStorage.removeItem('authToken'); 
    localStorage.removeItem('user');
    window.location.href = 'index.html'; 
}

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const config = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

       if (!response.ok) {
            if (response.status === 401) { 
                handleAuthError();
            }

            const errorData = await response.json();
            throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
        }

        return await response.json(); 
    } catch (error) {
        console.error(`API request error for endpoint ${endpoint}:`, error);
        throw error;
    }
}

async function downloadRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const config = {
        method: 'GET',
        headers: {
            ...options.headers,
        },
        ...options,
    };

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

   if (!response.ok) {
        if (response.status === 401) {
            handleAuthError();
        }
        try {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro ${response.status}`);
        } catch (e) {
            throw new Error(`Erro no servidor: ${response.status}`);
        }
    }
    
    return response; 
}

export const login = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const register = (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const mudarSenha = (data) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) });

export const getContatos = (queryParams = '') => request(`/contatos?${queryParams}`);
export const getLixeira = () => request('/contatos/lixeira');
export const getContatoById = (id) => request(`/contatos/${id}`);
export const createContato = (data) => request('/contatos', { method: 'POST', body: JSON.stringify(data) });
export const updateContato = (id, data) => request(`/contatos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteContato = (id) => request(`/contatos/${id}`, { method: 'DELETE' });
export const restaurarContato = (id) => request(`/contatos/${id}/restore`, { method: 'POST' });
export const deletePermanente = (id) => request(`/contatos/${id}/permanent`, { method: 'DELETE' });
export const registrarInteracaoManual = (contatoId, dados) => request(`/contatos/${contatoId}/historico`, { method: 'POST', body: JSON.stringify(dados) });
export const getHistorico = (contatoId) => request(`/contatos/${contatoId}/historico`);

export const agendarLembrete = (contatoId, data) => request(`/contatos/${contatoId}/lembrete`, { method: 'POST', body: JSON.stringify(data) });
export const removerLembrete = (contatoId) => request(`/contatos/${contatoId}/lembrete`, { method: 'DELETE' });

export const getStatus = () => request('/status');
export const getPolos = () => request('/polos');

export const getAllUsers = () => request('/users');
export const toggleUserStatus = (userId, newStatus) => request(`/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ is_active: newStatus }) });
export const updateUserRole = (userId, newRole) => request(`/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });

export const getMatriculasPorCanal = () => request('/analytics/matriculas-por-canal');
export const getMatriculasPorPolo = () => request('/analytics/matriculas-por-polo');
export const getNovosContatosMes = (ano, mes) => {
    const queryParams = (ano && mes) ? `?year=${ano}&month=${mes}` : '';
    return request(`/analytics/novos-contatos-mes${queryParams}`);
};

export const exportContatosCSVRequest = (queryParams) => downloadRequest(`/contatos/export${queryParams}`);
