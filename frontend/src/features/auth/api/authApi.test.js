import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from './authApi';
import apiClient from '../../../api/apiClient';

vi.mock('../../../api/apiClient', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

describe('authApi', () => {
    beforeEach(() => vi.clearAllMocks());

    it('login should POST email and password', async () => {
        apiClient.post.mockResolvedValue({ token: 'abc' });
        const result = await authApi.login('a@b.com', 'pass');
        expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', { email: 'a@b.com', password: 'pass' });
        expect(result).toEqual({ token: 'abc' });
    });

    it('register should POST email and password', async () => {
        apiClient.post.mockResolvedValue({ id: 1 });
        await authApi.register('a@b.com', 'pass');
        expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register', { email: 'a@b.com', password: 'pass' });
    });

    it('getSession should GET session', async () => {
        apiClient.get.mockResolvedValue({ valid: true });
        const result = await authApi.getSession();
        expect(apiClient.get).toHaveBeenCalledWith('/api/auth/session');
        expect(result).toEqual({ valid: true });
    });
});
