import apiClient from './apiClient';

export const api = {
    // Auth
    auth: {
        login: (email, password) => apiClient.post('/api/auth/login', { email, password }),
        register: (email, password) => apiClient.post('/api/auth/register', { email, password }),
        verify: (token) => apiClient.get(`/api/auth/verify?token=${token}`),
        getSession: () => apiClient.get('/api/auth/session'),
    },

    // Books
    books: {
        getAll: (page = 0, size = 12) => apiClient.get(`/api/books?page=${page}&size=${size}`),
        getById: (id) => apiClient.get(`/api/books/${id}`),
        delete: (id) => apiClient.delete(`/api/books/${id}`),
        deleteAll: () => apiClient.delete('/api/books'),
        updateProgress: (id, currentPage) => apiClient.request(`/api/books/${id}/progress`, {
            method: 'PATCH',
            body: JSON.stringify({ currentPage })
        }),
        updateStatus: (id, completed) => apiClient.request(`/api/books/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ completed })
        }),
    },

    // Sessions
    sessions: {
        getActive: () => apiClient.get(`/api/sessions/active?_t=${new Date().getTime()}`),
        start: (bookId) => apiClient.post('/api/sessions/start', { bookId }),
        stop: (endTime, endPage) => {
            const body = {};
            if (endTime) body.endTime = endTime.toISOString();
            if (endPage !== undefined) body.endPage = endPage;
            return apiClient.post('/api/sessions/stop', body);
        },
        excludeTime: (millis) => apiClient.post('/api/sessions/active/exclude-time', { millis }),
    }
};

export default api;
