import apiClient from '../../api/apiClient';

/**
 * Discovery API client
 */
const discoveryApi = {
    /**
     * Get all discovery data (authors, categories, recent searches)
     */
    getAll: () => apiClient.get('/api/discovery'),

    /**
     * Get recommendations by top authors
     */
    getByAuthors: () => apiClient.get('/api/discovery/authors'),

    /**
     * Get recommendations by top categories
     */
    getByCategories: () => apiClient.get('/api/discovery/categories'),

    /**
     * Get recommendations by recent searches
     */
    getByRecentSearches: () => apiClient.get('/api/discovery/recent-searches'),

    /**
     * Log a search query
     */
    logSearch: (query) => apiClient.post(`/api/discovery/search-log?query=${encodeURIComponent(query)}`),
};

export default discoveryApi;
