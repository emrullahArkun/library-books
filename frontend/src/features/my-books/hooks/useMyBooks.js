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

    const updateBookProgress = async (id, currentPage) => {
        console.log('Updating progress for book:', id, 'to page:', currentPage);
        try {
            const res = await fetch(`/api/books/${id}/progress`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: JSON.stringify({ currentPage })
            });

            if (res.ok) {
                const updatedBook = await res.json();
                console.log('Received updated book from backend:', updatedBook);
                setBooks(prev => {
                    const newBooks = prev.map(b => b.id === id ? updatedBook : b);
                    console.log('New books state:', newBooks);
                    return newBooks;
                });
                return true;
            } else {
                console.error('Update failed with status:', res.status);
                const text = await res.text();
                console.error('Error response:', text);
                alert('Update failed: ' + text);
            }
        } catch (error) {
            console.error('Failed to update progress', error);
            alert('Failed to update progress: ' + error.message);
        }
        return false;
    };

    const updateBookStatus = async (id, completed) => {
        try {
            const res = await fetch(`/api/books/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: JSON.stringify({ completed })
            });

            if (res.ok) {
                const updatedBook = await res.json();
                setBooks(prev => prev.map(b => b.id === id ? updatedBook : b));
                return true;
            } else {
                const text = await res.text();
                alert('Status update failed: ' + text);
            }
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status: ' + error.message);
        }
        return false;
    };

    return {
        books,
        loading,
        error,
        selectedBooks,
        toggleSelection,
        deleteBook,
        deleteSelected,
        deleteAll,
        updateBookProgress,
        updateBookStatus
    };
};
