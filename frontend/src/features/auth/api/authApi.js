import apiClient from '../../../api/apiClient';

export const authApi = {
    login: (email, password) => apiClient.post('/api/auth/login', { email, password }),
    register: (email, password) => apiClient.post('/api/auth/register', { email, password }),
    verify: (token) => apiClient.get(`/api/auth/verify?token=${token}`),
    getSession: () => apiClient.get('/api/auth/session'),
};
