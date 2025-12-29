import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const useMyBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState(new Set());
    const { token } = useAuth();

    const fetchBooks = () => {
        if (!token) return;
        setLoading(true);
        fetch('/api/books', {
            headers: {
                'Authorization': `Basic ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch books');
                return res.json();
            })
            .then(data => {
                setBooks(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (token) fetchBooks();
    }, [token]);

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
        try {
            const res = await fetch(`/api/books/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Basic ${token}` }
            });
            if (res.ok) {
                fetchBooks();
                const newSelection = new Set(selectedBooks);
                newSelection.delete(id);
                setSelectedBooks(newSelection);
            }
        } catch (error) {
            console.error('Failed to delete book', error);
        }
    };

    const deleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedBooks.size} books?`)) return;

        const promises = Array.from(selectedBooks).map(id =>
            fetch(`/api/books/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Basic ${token}` }
            })
        );

        await Promise.all(promises);
        setSelectedBooks(new Set());
        fetchBooks();
    };

    const deleteAll = async () => {
        if (!window.confirm('Delete ALL books? This cannot be undone.')) return;
        try {
            const res = await fetch('/api/books', {
                method: 'DELETE',
                headers: { 'Authorization': `Basic ${token}` }
            });
            if (res.ok) {
                setBooks([]);
                setSelectedBooks(new Set());
            }
        } catch (error) {
            console.error('Failed to delete all books', error);
        }
    };

    return {
        books,
        loading,
        error,
        selectedBooks,
        toggleSelection,
        deleteBook,
        deleteSelected,
        deleteAll
    };
};
