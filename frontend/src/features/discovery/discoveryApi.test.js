import { describe, it, expect, vi, beforeEach } from 'vitest';
import discoveryApi from './discoveryApi';
import apiClient from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('discoveryApi', () => {
    beforeEach(() => vi.clearAllMocks());

    it('getAll should GET /api/discovery', async () => {
        apiClient.get.mockResolvedValue({});
        await discoveryApi.getAll();
        expect(apiClient.get).toHaveBeenCalledWith('/api/discovery');
    });

    it('getByAuthors should GET authors endpoint', async () => {
        await discoveryApi.getByAuthors();
        expect(apiClient.get).toHaveBeenCalledWith('/api/discovery/authors');
    });

    it('getByCategories should GET categories endpoint', async () => {
        await discoveryApi.getByCategories();
        expect(apiClient.get).toHaveBeenCalledWith('/api/discovery/categories');
    });

    it('getByRecentSearches should GET recent-searches endpoint', async () => {
        await discoveryApi.getByRecentSearches();
        expect(apiClient.get).toHaveBeenCalledWith('/api/discovery/recent-searches');
    });

    it('logSearch should POST with encoded query', async () => {
        await discoveryApi.logSearch('test query');
        expect(apiClient.post).toHaveBeenCalledWith('/api/discovery/search-log?query=test%20query');
    });

    it('logSearch should encode special characters', async () => {
        await discoveryApi.logSearch('C++ Bücher & co');
        expect(apiClient.post).toHaveBeenCalledWith('/api/discovery/search-log?query=C%2B%2B%20B%C3%BCcher%20%26%20co');
    });
});
