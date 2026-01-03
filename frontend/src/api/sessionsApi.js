import apiClient from './apiClient';

export const sessionsApi = {
    getActive: () => apiClient.get(`/api/sessions/active?_t=${new Date().getTime()}`),
    getByBookId: (bookId) => apiClient.get(`/api/sessions/book/${bookId}`),
    start: (bookId) => apiClient.post('/api/sessions/start', { bookId }),
    stop: (endTime, endPage) => {
        const body = {};
        if (endTime) body.endTime = endTime.toISOString();
        if (endPage !== undefined) body.endPage = endPage;
        return apiClient.post('/api/sessions/stop', body);
    },
    excludeTime: (millis) => apiClient.post('/api/sessions/active/exclude-time', { millis }),
};
