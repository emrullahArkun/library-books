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

            // Filter out books without ISBN or without a valid cover URL
            const filterValidBooks = (books) => books.filter(book =>
                book.isbn && book.coverUrl && book.coverUrl.trim() !== ''
            );

            setData({
                byAuthor: {
                    authors: response.byAuthor?.authors || [],
                    books: filterValidBooks(response.byAuthor?.books || [])
                },
                byCategory: {
                    categories: response.byCategory?.categories || [],
                    books: filterValidBooks(response.byCategory?.books || [])
                },
                bySearch: {
                    queries: response.bySearch?.queries || [],
                    books: filterValidBooks(response.bySearch?.books || [])
                }
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
