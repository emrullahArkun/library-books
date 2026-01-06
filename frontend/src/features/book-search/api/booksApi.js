import apiClient from '../../../api/apiClient';

export const booksApi = {
    getAll: (page = 0, size = 12) => apiClient.get(`/api/books?page=${page}&size=${size}`),
    getById: (id) => apiClient.get(`/api/books/${id}`),
    create: (bookData) => apiClient.post('/api/books', bookData),
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
};
