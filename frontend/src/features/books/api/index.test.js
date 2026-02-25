import { describe, it, expect, vi, beforeEach } from 'vitest';
import { booksApi } from './index';
import apiClient from '../../../api/apiClient';

vi.mock('../../../api/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
    },
}));

describe('booksApi', () => {
    beforeEach(() => vi.clearAllMocks());

    it('getAll should GET with page and size', async () => {
        apiClient.get.mockResolvedValue({ content: [] });
        await booksApi.getAll(2, 20);
        expect(apiClient.get).toHaveBeenCalledWith('/api/books?page=2&size=20');
    });

    it('getAll should use default page=0 size=12', async () => {
        apiClient.get.mockResolvedValue({ content: [] });
        await booksApi.getAll();
        expect(apiClient.get).toHaveBeenCalledWith('/api/books?page=0&size=12');
    });

    it('getOwnedIsbns should GET owned', async () => {
        apiClient.get.mockResolvedValue(['isbn1']);
        const result = await booksApi.getOwnedIsbns();
        expect(apiClient.get).toHaveBeenCalledWith('/api/books/owned');
        expect(result).toEqual(['isbn1']);
    });

    it('getById should GET by id', async () => {
        apiClient.get.mockResolvedValue({ id: 5 });
        await booksApi.getById(5);
        expect(apiClient.get).toHaveBeenCalledWith('/api/books/5');
    });

    it('create should POST bookData', async () => {
        await booksApi.create({ title: 'T' });
        expect(apiClient.post).toHaveBeenCalledWith('/api/books', { title: 'T' });
    });

    it('delete should DELETE by id', async () => {
        await booksApi.delete(3);
        expect(apiClient.delete).toHaveBeenCalledWith('/api/books/3');
    });

    it('deleteAll should DELETE all', async () => {
        await booksApi.deleteAll();
        expect(apiClient.delete).toHaveBeenCalledWith('/api/books');
    });

    it('updateProgress should PATCH progress', async () => {
        await booksApi.updateProgress(1, 50);
        expect(apiClient.patch).toHaveBeenCalledWith('/api/books/1/progress', { currentPage: 50 });
    });

    it('updateStatus should PATCH status', async () => {
        await booksApi.updateStatus(1, true);
        expect(apiClient.patch).toHaveBeenCalledWith('/api/books/1/status', { completed: true });
    });

    it('updateGoal should PATCH goal', async () => {
        await booksApi.updateGoal(1, 'WEEKLY', 100);
        expect(apiClient.patch).toHaveBeenCalledWith('/api/books/1/goal', { type: 'WEEKLY', pages: 100 });
    });
});
