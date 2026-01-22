import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { authApi } from '../features/auth/api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);

        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    // 1. Optimistically set state
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setToken(storedToken);

                    // 2. Validate against server
                    // authApi.getSession() returns the parsed JSON data, not the Response object.
                    // The apiClient throws on non-2xx responses.
                    const res = await authApi.getSession();

                    if (!res) {
                        throw new Error("Session invalid");
                    }
                    // Optional: check res.valid if the backend sends it
                    // if (!res.valid) throw ...
                } catch (error) {
                    console.error("Session validation failed:", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth();

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);


    const login = useCallback((userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        login,
        logout,
        loading
    }), [user, token, login, logout, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

