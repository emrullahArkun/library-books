import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import discoveryApi from '../discoveryApi';

/**
 * Hook for managing discovery data
 */
export const useDiscovery = () => {
    const { token, user } = useAuth();

    const {
        data,
        isLoading: loading,
        error,
        refetch: refresh
    } = useQuery({
        queryKey: ['discovery', user?.email],
        queryFn: async () => {
            const response = await discoveryApi.getAll();

            // Filter out books without ISBN or without a valid cover URL
            const filterValidBooks = (books) => books.filter(book =>
                book.isbn && book.coverUrl && book.coverUrl.trim() !== ''
            );

            return {
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
            };
        },
        enabled: !!token, // Only fetch if authenticated
        staleTime: 5 * 60 * 1000, // Cache for 5 mins
    });

    return {
        loading,
        error: error ? error.message : null,
        data: data || {
            byAuthor: { authors: [], books: [] },
            byCategory: { categories: [], books: [] },
            bySearch: { queries: [], books: [] }
        },
        refresh
    };
};

export default useDiscovery;
