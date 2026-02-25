import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth, AuthContext } from './AuthContext';
import { useContext } from 'react';

// Mock authApi
vi.mock('../features/auth/api/authApi', () => ({
    authApi: {
        getSession: vi.fn(),
    },
}));

import { authApi } from '../features/auth/api/authApi';

// Helper component that exposes context values
const TestConsumer = ({ onRender }) => {
    const ctx = useAuth();
    onRender(ctx);
    return <div data-testid="user">{ctx.user ? ctx.user.email : 'none'}</div>;
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should provide default values: user=null, token=null, loading=true initially', async () => {
        authApi.getSession.mockResolvedValue(null);
        let captured;

        await act(async () => {
            render(
                <AuthProvider>
                    <TestConsumer onRender={(ctx) => { captured = ctx; }} />
                </AuthProvider>
            );
        });

        // After init, loading should be false
        expect(captured.loading).toBe(false);
        expect(captured.user).toBeNull();
        expect(captured.token).toBeNull();
    });

    it('should restore session from localStorage when token+user exist and session is valid', async () => {
        localStorage.setItem('token', 'valid-token');
        localStorage.setItem('user', JSON.stringify({ email: 'test@test.com' }));
        authApi.getSession.mockResolvedValue({ valid: true });

        let captured;
        await act(async () => {
            render(
                <AuthProvider>
                    <TestConsumer onRender={(ctx) => { captured = ctx; }} />
                </AuthProvider>
            );
        });

        await waitFor(() => {
            expect(captured.user).toEqual({ email: 'test@test.com' });
            expect(captured.token).toBe('valid-token');
            expect(captured.loading).toBe(false);
        });
    });

    it('should clear session when server validation fails', async () => {
        localStorage.setItem('token', 'expired-token');
        localStorage.setItem('user', JSON.stringify({ email: 'old@test.com' }));
        authApi.getSession.mockRejectedValue(new Error('Unauthorized'));

        let captured;
        await act(async () => {
            render(
                <AuthProvider>
                    <TestConsumer onRender={(ctx) => { captured = ctx; }} />
                </AuthProvider>
            );
        });

        await waitFor(() => {
            expect(captured.user).toBeNull();
            expect(captured.token).toBeNull();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    it('should clear session when getSession returns null/falsy', async () => {
        localStorage.setItem('token', 'token');
        localStorage.setItem('user', JSON.stringify({ email: 'x@x.com' }));
        authApi.getSession.mockResolvedValue(null);

        let captured;
        await act(async () => {
            render(
                <AuthProvider>
                    <TestConsumer onRender={(ctx) => { captured = ctx; }} />
                </AuthProvider>
            );
        });

        await waitFor(() => {
            expect(captured.user).toBeNull();
            expect(captured.token).toBeNull();
        });
    });

    it('login should store user and token', async () => {
        authApi.getSession.mockResolvedValue(null);
        let captured;

        await act(async () => {
            render(
                <AuthProvider>
                    <TestConsumer onRender={(ctx) => { captured = ctx; }} />
                </AuthProvider>
            );
        });

        act(() => {
            captured.login({ email: 'new@test.com' }, 'new-token');
        });

        expect(captured.user).toEqual({ email: 'new@test.com' });
        expect(localStorage.getItem('token')).toBe('new-token');
    });

    it('logout should clear user and token', async () => {
        localStorage.setItem('token', 'token');
        localStorage.setItem('user', JSON.stringify({ email: 'x@x.com' }));
        authApi.getSession.mockResolvedValue({ valid: true });

        let captured;
        await act(async () => {
            render(
                <AuthProvider>
                    <TestConsumer onRender={(ctx) => { captured = ctx; }} />
                </AuthProvider>
            );
        });

        act(() => {
            captured.logout();
        });

        expect(captured.user).toBeNull();
        expect(captured.token).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('should logout on auth:unauthorized event', async () => {
        localStorage.setItem('token', 'token');
        localStorage.setItem('user', JSON.stringify({ email: 'x@x.com' }));
        authApi.getSession.mockResolvedValue({ valid: true });

        let captured;
        await act(async () => {
            render(
                <AuthProvider>
                    <TestConsumer onRender={(ctx) => { captured = ctx; }} />
                </AuthProvider>
            );
        });

        await waitFor(() => expect(captured.user).not.toBeNull());

        act(() => {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        });

        expect(captured.user).toBeNull();
        expect(captured.token).toBeNull();
    });

    it('useAuth should throw when used outside AuthProvider', () => {
        const BadComponent = () => {
            useAuth();
            return null;
        };

        expect(() => render(<BadComponent />)).toThrow(
            'useAuth must be used within an AuthProvider'
        );
    });
});
