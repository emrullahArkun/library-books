import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const useBookSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [startIndex, setStartIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const { token } = useAuth();

    const fetchBooks = async (index, isLoadMore) => {
        if (loading) return;
        setLoading(true);
        try {
            let searchUrl = 'https://www.googleapis.com/books/v1/volumes?q=';
            const queryPart = query.trim();

            if (!queryPart) {
                setLoading(false);
                return;
            }

            const finalQuery = encodeURIComponent(queryPart);
            const response = await fetch(`${searchUrl}${finalQuery}&startIndex=${index}&maxResults=20`);
            const data = await response.json();

            if (data.items) {
                if (isLoadMore) {
                    setResults(prev => [...prev, ...data.items]);
                } else {
                    setResults(data.items);
                    setTotalItems(data.totalItems || 0);
                }
                if (data.items.length < 20) setHasMore(false);
            } else {
                if (!isLoadMore) {
                    setResults([]);
                    setTotalItems(0);
                }
                setHasMore(false);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch from Google Books');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (hasMore && !loading) {
            const nextIndex = startIndex + 20;
            setStartIndex(nextIndex);
            fetchBooks(nextIndex, true);
        }
    };

    const searchBooks = (e) => {
        if (e) e.preventDefault();
        setStartIndex(0);
        setHasMore(true);
        setResults([]);
        fetchBooks(0, false);
    };

    const addBookToLibrary = async (book) => {
        if (!token) {
            setMessage({ text: 'Please login to add books', type: 'error' });
            return;
        }

        const volumeInfo = book.volumeInfo;
        const isbnInfo = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')
            || volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10');

        if (!isbnInfo) {
            setMessage({ text: 'Cannot add book: No ISBN found', type: 'error' });
            return;
        }

        const newBook = {
            title: volumeInfo.title,
            isbn: isbnInfo.identifier,
            authorName: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author',
            publishDate: volumeInfo.publishedDate || 'Unknown Date',
            coverUrl: volumeInfo.imageLinks?.thumbnail || ''
        };

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: JSON.stringify(newBook)
            });

            if (response.ok) {
                setMessage({ text: `Added "${newBook.title}" to library!`, type: 'success' });
                return true; // Success signal
            } else {
                setMessage({ text: 'Failed to add book to library', type: 'error' });
                return false;
            }
        } catch (err) {
            setMessage({ text: 'Error connecting to backend', type: 'error' });
            return false;
        }
    };

    return {
        query, setQuery,
        results,
        error,
        message,
        hasMore,
        loading,
        searchBooks,
        loadMore,
        addBookToLibrary
    };
};
