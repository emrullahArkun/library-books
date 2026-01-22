import apiClient from '../../../api/apiClient';

export const booksApi = {
    getAll: (page = 0, size = 12) => apiClient.get(`/api/books?page=${page}&size=${size}`),
    getOwnedIsbns: () => apiClient.get('/api/books/owned'),
    getById: (id) => apiClient.get(`/api/books/${id}`),
    create: (bookData) => apiClient.post('/api/books', bookData),
    delete: (id) => apiClient.delete(`/api/books/${id}`),
    deleteAll: () => apiClient.delete('/api/books'),
    updateProgress: (id, currentPage) => apiClient.patch(`/api/books/${id}/progress`, { currentPage }),
    updateStatus: (id, completed) => apiClient.patch(`/api/books/${id}/status`, { completed }),
};
