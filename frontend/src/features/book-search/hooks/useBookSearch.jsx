import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { mapGoogleBookToNewBook } from '../../../utils/googleBooks';
import { booksApi } from '../api/booksApi';

export const useBookSearch = () => {
    const [query, setQuery] = useState('');
    const { token } = useAuth();
    const toast = useToast();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    // Fetch owned ISBNs to check duplicates
    const { data: ownedIsbns } = useQuery({
        queryKey: ['ownedIsbns'],
        queryFn: async () => {
            if (!token) return [];
            const response = await booksApi.getOwnedIsbns();
            if (response.ok) return response.json();
            return [];
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const ownedIsbnsSet = new Set((ownedIsbns || []).map(isbn => isbn.replace(/-/g, '')));

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['books', query],
        queryFn: async ({ pageParam = 0 }) => {
            if (!query.trim()) return { items: [], totalItems: 0 };
            const finalQuery = encodeURIComponent(query.trim());
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${finalQuery}&startIndex=${pageParam}&maxResults=36`);
            if (!response.ok) throw new Error('Failed to fetch from Google Books');
            return response.json();
        },
        getNextPageParam: (lastPage, allPages) => {
            const loadedItems = allPages.flatMap(p => p.items || []).length;
            if (loadedItems < (lastPage.totalItems || 0)) {
                return loadedItems;
            }
            return undefined;
        },
        enabled: !!query.trim(),
        initialPageParam: 0
    });

    const allRawItems = data ? data.pages.flatMap(page => page.items || []) : [];
    // Filter out items without IDs or volumeInfo, and deduplicate by ID
    const results = Array.from(
        new Map(
            allRawItems
                .filter(item => item.id && item.volumeInfo)
                .map(item => [item.id, item])
        ).values()
    );

    const totalItems = data?.pages[0]?.totalItems || 0;

    const addBookMutation = useMutation({
        mutationFn: async (book) => {
            if (!token) throw new Error(t('search.toast.loginRequired'));

            const volumeInfo = book.volumeInfo;
            const isbnInfo = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')
                || volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10');

            if (!isbnInfo && !book.id) throw new Error(t('search.toast.noIsbn'));

            // Use utility for mapping logic
            const newBook = mapGoogleBookToNewBook(volumeInfo, isbnInfo, book.id);

            const response = await booksApi.create(newBook);

            if (response.ok) {
                return newBook;
            } else if (response.status === 409) {
                throw new Error(t('search.toast.duplicate'));
            } else {
                throw new Error(t('search.toast.addFailed'));
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            queryClient.invalidateQueries({ queryKey: ['ownedIsbns'] });
            toast.close('add-book-toast');
            toast({
                id: 'add-book-toast',
                position: 'top',
                duration: 3000,
                containerStyle: {
                    marginTop: '80px'
                },
                render: () => (
                    <div style={{
                        backgroundColor: '#38A169', // green.500
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        Buch wurde erfolgreich hinzugefügt
                    </div>
                )
            });
        },
        onError: (err) => {
            // Check if it's a duplicate error based on the message string key or actual message
            // The mutationFn throws Error(t('search.toast.duplicate'))
            // We'll trust the error message is what we expect or we handle it generically
            const isDuplicate = err.message === t('search.toast.duplicate');
            const message = isDuplicate ? 'Buch gibt es schon in der Sammlung' : err.message;
            const bgColor = isDuplicate ? '#DD6B20' : '#E53E3E'; // orange.500 : red.500

            toast.close('add-book-toast');
            toast({
                id: 'add-book-toast',
                position: 'top',
                duration: 3000,
                containerStyle: {
                    marginTop: '80px'
                },
                render: () => (
                    <div style={{
                        backgroundColor: bgColor,
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )
            });
        }
    });

    const searchBooks = (e) => {
        if (e) e.preventDefault();
        // Changing the query key (via setQuery) automatically triggers a refetch
    };

    return {
        query, setQuery,
        results,
        error: error ? error.message : null,
        hasMore: hasNextPage,
        loading: isLoading || isFetching,
        searchBooks,
        loadMore: fetchNextPage,
        addBookToLibrary: addBookMutation.mutateAsync,
        ownedIsbns: ownedIsbnsSet
    };
};

