const API_URL = 'http://localhost:3001/api';
const DEFAULT_USER_ID = 'test-user-' + Math.random().toString(36).substr(2, 9);

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': DEFAULT_USER_ID,
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, message: data.message, status: response.status };
        }
        return data;
    } catch (error) {
        return { success: false, message: `네트워크 에러: ${error.message}` };
    }
}

export const api = {
    accounts: {
        create: (data) => apiCall('/accounts', { method: 'POST', body: JSON.stringify(data) }),
        getAll: () => apiCall('/accounts', { method: 'GET' }),
        getById: (id) => apiCall(`/accounts/${id}`, { method: 'GET' }),
        update: (id, data) => apiCall(`/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id) => apiCall(`/accounts/${id}`, { method: 'DELETE' })
    }
};

export default api;