import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { booksApi } from '../../book-search/api/booksApi';

export const useMyBooks = (pageSize = 12) => {
    const [page, setPage] = useState(0);
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const { data, isLoading: loading, error } = useQuery({
        queryKey: ['myBooks', token, page, pageSize],
        queryFn: async () => {
            if (!token) return { content: [], totalPages: 0 };
            const response = await booksApi.getAll(page, pageSize);
            if (!response.ok) throw new Error('Failed to fetch books');
            return response.json();
        },
        placeholderData: keepPreviousData,
        enabled: !!token
    });

    const books = data?.content || [];
    const totalPages = data?.totalPages || 0;

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await booksApi.delete(id);
            if (!res.ok) throw new Error('Failed to delete book');
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
            alert(t('myBooks.deleteFailed', { message: err.message }));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
        }
    });

    const deleteAllMutation = useMutation({
        mutationFn: async () => {
            const res = await booksApi.deleteAll();
            if (!res.ok) throw new Error('Failed to delete all books');
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
            alert(t('myBooks.deleteAllFailed', { message: err.message }));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            setSelectedBooks(new Set());
        }
    });

    const updateProgressMutation = useMutation({
        mutationFn: async ({ id, currentPage }) => {
            const res = await booksApi.updateProgress(id, currentPage);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to update progress');
            }
            return res.json();
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
            alert(t('myBooks.updateProgressFailed', { message: err.message }));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, completed }) => {
            const res = await booksApi.updateStatus(id, completed);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to update status');
            }
            return res.json();
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
            alert(t('myBooks.updateStatusFailed', { message: err.message }));
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

    const deleteBook = async (id) => {
        if (!window.confirm(t('myBooks.confirmDelete'))) return;
        deleteMutation.mutate(id);
        setSelectedBooks(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const deleteSelected = async () => {
        if (!window.confirm(t('myBooks.confirmDeleteSelected', { count: selectedBooks.size }))) return;

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

        const failed = results.some(r => r.status === 'fulfilled' && !r.value.ok) ||
            results.some(r => r.status === 'rejected');

        if (failed) {
            console.error('Some deletions failed', results);
            alert(t('myBooks.deleteFailed', { message: 'Some items could not be deleted.' }));
            // Rollback if failed
            if (previousData) {
                queryClient.setQueryData(['myBooks', token, page, pageSize], previousData);
            }
        }

        // Always re-fetch to be safe
        queryClient.invalidateQueries({ queryKey: ['myBooks'] });
    };

    const deleteAll = () => {
        if (!window.confirm(t('myBooks.confirmDeleteAll'))) return;
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
        totalPages
    };
};
