import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { booksApi } from '../../books/api';

export const useMyBooks = (pageSize = 12) => {
    const [page, setPage] = useState(0);
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const { token } = useAuth();
    const queryClient = useQueryClient();

    const { data, isLoading: loading, error } = useQuery({
        queryKey: ['myBooks', token, page, pageSize],
        queryFn: async () => {
            if (!token) return { content: [], totalPages: 0 };
            const data = await booksApi.getAll(page, pageSize);
            return data;
        },
        placeholderData: keepPreviousData,
        enabled: !!token
    });

    // Reset page to 0 if pageSize changes to prevent empty pages
    // actually better to do this in the component or via a side effect of the pageSize changing.
    // simpler: just return what we have.

    const books = data?.content || [];
    const totalPages = data?.totalPages || 0;

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await booksApi.delete(id);
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['myBooks'] }); // Invalidate all myBooks queries
            const previousData = queryClient.getQueryData(['myBooks', token, page, pageSize]);

            // Optimistic update for current page
            if (previousData) {
                queryClient.setQueryData(['myBooks', token, page, pageSize], {
                    ...previousData,
                    content: previousData.content.filter(book => book.id !== id)
                });
            }
            return { previousData };
        },
        onError: (err, id, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['myBooks', token, page, pageSize], context.previousData);
            }
            // Propagate error to be handled by component
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
        }
    });

    const deleteAllMutation = useMutation({
        mutationFn: async () => {
            await booksApi.deleteAll();
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['myBooks'] });
            const previousData = queryClient.getQueryData(['myBooks', token, page, pageSize]);
            queryClient.setQueryData(['myBooks', token, page, pageSize], { content: [], totalPages: 0 });
            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['myBooks', token, page, pageSize], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            setSelectedBooks(new Set());
        }
    });

    const updateProgressMutation = useMutation({
        mutationFn: async ({ id, currentPage }) => {
            return await booksApi.updateProgress(id, currentPage);
        },
        onMutate: async ({ id, currentPage }) => {
            await queryClient.cancelQueries({ queryKey: ['myBooks'] });
            const previousData = queryClient.getQueryData(['myBooks', token, page, pageSize]);

            if (previousData) {
                queryClient.setQueryData(['myBooks', token, page, pageSize], {
                    ...previousData,
                    content: previousData.content.map(book => book.id === id ? { ...book, currentPage } : book)
                });
            }
            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['myBooks', token, page, pageSize], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, completed }) => {
            return await booksApi.updateStatus(id, completed);
        },
        onMutate: async ({ id, completed }) => {
            await queryClient.cancelQueries({ queryKey: ['myBooks'] });
            const previousData = queryClient.getQueryData(['myBooks', token, page, pageSize]);

            if (previousData) {
                queryClient.setQueryData(['myBooks', token, page, pageSize], {
                    ...previousData,
                    content: previousData.content.map(book => book.id === id ? { ...book, completed } : book)
                });
            }
            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['myBooks', token, page, pageSize], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
        }
    });

    const toggleSelection = (id) => {
        setSelectedBooks(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const deleteBook = (id) => {
        deleteMutation.mutate(id);
        setSelectedBooks(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const deleteSelected = async () => {

        // Optimistic Update
        const ids = Array.from(selectedBooks);

        // 1. Snapshot previous data
        await queryClient.cancelQueries({ queryKey: ['myBooks'] });
        const previousData = queryClient.getQueryData(['myBooks', token, page, pageSize]);

        // 2. Optimistically remove from UI
        if (previousData) {
            queryClient.setQueryData(['myBooks', token, page, pageSize], {
                ...previousData,
                content: previousData.content.filter(book => !selectedBooks.has(book.id))
            });
        }

        // 3. Clear selection immediately
        setSelectedBooks(new Set());

        // 4. Perform actual deletions
        const results = await Promise.allSettled(
            ids.map(id =>
                booksApi.delete(id)
            )
        );

        const failed = results.some(r => r.status === 'rejected');

        if (failed) {
            console.error('Some deletions failed', results);
            console.error('Some deletions failed', results);
            // Component should check mutation state or we can return a promise result
            // Rollback if failed
            if (previousData) {
                queryClient.setQueryData(['myBooks', token, page, pageSize], previousData);
            }
        }

        // Always re-fetch to be safe
        queryClient.invalidateQueries({ queryKey: ['myBooks'] });
    };

    const deleteAll = () => {
        deleteAllMutation.mutate();
    };

    const updateBookProgress = (id, currentPage) => {
        updateProgressMutation.mutate({ id, currentPage });
    };

    const updateBookStatus = (id, completed) => {
        updateStatusMutation.mutate({ id, completed });
    };

    return {
        books,
        loading,
        error: error ? error.message : null,
        selectedBooks,
        toggleSelection,
        deleteBook,
        deleteSelected,
        deleteAll,
        updateBookProgress,
        updateBookStatus,
        page,
        setPage,
        totalPages,
        // Expose mutation states so component can show toasts/errors
        deleteError: deleteMutation.error,
        updateProgressError: updateProgressMutation.error
    };
};
