import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const useMyBooks = () => {
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const { data: books = [], isLoading: loading, error } = useQuery({
        queryKey: ['myBooks', token],
        queryFn: async () => {
            if (!token) return [];
            const response = await fetch('/api/books', {
                headers: { 'Authorization': `Basic ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch books');
            return response.json();
        },
        enabled: !!token
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/books/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Basic ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete book');
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['myBooks', token] });
            const previousBooks = queryClient.getQueryData(['myBooks', token]);
            queryClient.setQueryData(['myBooks', token], (old = []) => old.filter(book => book.id !== id));
            return { previousBooks };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['myBooks', token], context.previousBooks);
            alert(t('myBooks.deleteFailed', { message: err.message }));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks', token] });
        }
    });

    const deleteAllMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/books', {
                method: 'DELETE',
                headers: { 'Authorization': `Basic ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete all books');
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['myBooks', token] });
            const previousBooks = queryClient.getQueryData(['myBooks', token]);
            queryClient.setQueryData(['myBooks', token], []);
            return { previousBooks };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['myBooks', token], context.previousBooks);
            alert(t('myBooks.deleteAllFailed', { message: err.message }));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks', token] });
            setSelectedBooks(new Set());
        }
    });

    const updateProgressMutation = useMutation({
        mutationFn: async ({ id, currentPage }) => {
            const res = await fetch(`/api/books/${id}/progress`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: JSON.stringify({ currentPage })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to update progress');
            }
            return res.json();
        },
        onMutate: async ({ id, currentPage }) => {
            await queryClient.cancelQueries({ queryKey: ['myBooks', token] });
            const previousBooks = queryClient.getQueryData(['myBooks', token]);
            queryClient.setQueryData(['myBooks', token], (old = []) =>
                old.map(book => book.id === id ? { ...book, currentPage } : book)
            );
            return { previousBooks };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['myBooks', token], context.previousBooks);
            alert(t('myBooks.updateProgressFailed', { message: err.message }));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks', token] });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, completed }) => {
            const res = await fetch(`/api/books/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: JSON.stringify({ completed })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to update status');
            }
            return res.json();
        },
        onMutate: async ({ id, completed }) => {
            await queryClient.cancelQueries({ queryKey: ['myBooks', token] });
            const previousBooks = queryClient.getQueryData(['myBooks', token]);
            queryClient.setQueryData(['myBooks', token], (old = []) =>
                old.map(book => book.id === id ? { ...book, completed } : book)
            );
            return { previousBooks };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['myBooks', token], context.previousBooks);
            alert(t('myBooks.updateStatusFailed', { message: err.message }));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks', token] });
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
        // Optimistically update selection
        setSelectedBooks(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const deleteSelected = async () => {
        if (!window.confirm(t('myBooks.confirmDeleteSelected', { count: selectedBooks.size }))) return;

        const ids = Array.from(selectedBooks);
        const results = await Promise.allSettled(
            ids.map(id =>
                fetch(`/api/books/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Basic ${token}` }
                })
            )
        );

        const failed = results.some(r => r.status === 'fulfilled' && !r.value.ok) ||
            results.some(r => r.status === 'rejected');

        if (failed) {
            console.error('Some deletions failed', results);
            alert(t('myBooks.deleteFailed', { message: 'Some items could not be deleted.' }));
        }

        queryClient.invalidateQueries({ queryKey: ['myBooks', token] });
        setSelectedBooks(new Set());
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
        updateBookStatus
    };
};
