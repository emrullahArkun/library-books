import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useMyBooks = () => {
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const { token } = useAuth();
    const queryClient = useQueryClient();

    const { data: books = [], isLoading: loading, error } = useQuery({
        queryKey: ['myBooks'],
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
            await queryClient.cancelQueries({ queryKey: ['myBooks'] });
            const previousBooks = queryClient.getQueryData(['myBooks']);
            queryClient.setQueryData(['myBooks'], (old) => old.filter(book => book.id !== id));
            return { previousBooks };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['myBooks'], context.previousBooks);
            alert('Failed to delete book: ' + err.message);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
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
            await queryClient.cancelQueries({ queryKey: ['myBooks'] });
            const previousBooks = queryClient.getQueryData(['myBooks']);
            queryClient.setQueryData(['myBooks'], []);
            return { previousBooks };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['myBooks'], context.previousBooks);
            alert('Failed to delete all books: ' + err.message);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
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
            await queryClient.cancelQueries({ queryKey: ['myBooks'] });
            const previousBooks = queryClient.getQueryData(['myBooks']);
            queryClient.setQueryData(['myBooks'], (old) =>
                old.map(book => book.id === id ? { ...book, currentPage } : book)
            );
            return { previousBooks };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['myBooks'], context.previousBooks);
            alert('Failed to update progress: ' + err.message);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
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
            await queryClient.cancelQueries({ queryKey: ['myBooks'] });
            const previousBooks = queryClient.getQueryData(['myBooks']);
            queryClient.setQueryData(['myBooks'], (old) =>
                old.map(book => book.id === id ? { ...book, completed } : book)
            );
            return { previousBooks };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['myBooks'], context.previousBooks);
            alert('Failed to update status: ' + err.message);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
        }
    });

    const toggleSelection = (id) => {
        const newSelection = new Set(selectedBooks);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedBooks(newSelection);
    };

    const deleteBook = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        deleteMutation.mutate(id);
        // Optimistically update selection
        if (selectedBooks.has(id)) {
            const newSelection = new Set(selectedBooks);
            newSelection.delete(id);
            setSelectedBooks(newSelection);
        }
    };

    const deleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedBooks.size} books?`)) return;
        // Run all deletions
        try {
            await Promise.all(
                Array.from(selectedBooks).map(id =>
                    fetch(`/api/books/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Basic ${token}` }
                    })
                )
            );
            // Invalidate once
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            setSelectedBooks(new Set());
        } catch (err) {
            console.error(err);
        }
    };

    const deleteAll = () => {
        if (!window.confirm('Delete ALL books? This cannot be undone.')) return;
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
