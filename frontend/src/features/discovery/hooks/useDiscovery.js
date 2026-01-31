import { useState, useEffect, useCallback } from 'react';
import discoveryApi from '../discoveryApi';

/**
 * Hook for managing discovery data
 */
export const useDiscovery = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        byAuthor: { authors: [], books: [] },
        byCategory: { categories: [], books: [] },
        bySearch: { queries: [], books: [] }
    });

    const fetchDiscoveryData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await discoveryApi.getAll();
            setData({
                byAuthor: response.byAuthor || { authors: [], books: [] },
                byCategory: response.byCategory || { categories: [], books: [] },
                bySearch: response.bySearch || { queries: [], books: [] }
            });
        } catch (err) {
            console.error('Failed to fetch discovery data:', err);
            setError(err.message || 'Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDiscoveryData();
    }, [fetchDiscoveryData]);

    const refresh = useCallback(() => {
        fetchDiscoveryData();
    }, [fetchDiscoveryData]);

    return {
        loading,
        error,
        data,
        refresh
    };
};

export default useDiscovery;
