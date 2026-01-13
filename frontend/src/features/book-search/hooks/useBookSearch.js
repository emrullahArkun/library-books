import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
            toast({
                title: t('search.toast.successTitle'),
                description: t('search.toast.successDesc', { title: variables.volumeInfo.title }),
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
                containerStyle: {
                    marginTop: '80px'
                }
            });
        },
        onError: (err) => {
            toast({
                title: t('search.toast.errorTitle'),
                description: err.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
                containerStyle: {
                    marginTop: '80px'
                }
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
        addBookToLibrary: addBookMutation.mutateAsync
    };
};

