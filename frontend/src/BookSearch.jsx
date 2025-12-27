import { useState, useEffect } from 'react';
import './BookSearch.css';

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'fiction', label: 'Fiction' },
    { id: 'thriller', label: 'Thriller' },
    { id: 'romance', label: 'Romance' },
    { id: 'history', label: 'History' },
    { id: 'science', label: 'Science' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'biography', label: 'Biography' },
];

function BookSearch({ onBookAdded }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [startIndex, setStartIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Live search effect with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Reset and search if query or category changes
            setStartIndex(0);
            setResults([]);
            setHasMore(true);

            if (query.trim() || activeCategory !== 'all') {
                fetchBooks(0, false);
            } else {
                setResults([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query, activeCategory]);

    const fetchBooks = async (index, isLoadMore) => {
        if (loading) return; // Prevent duplicate requests
        setLoading(true);
        try {
            let searchUrl = 'https://www.googleapis.com/books/v1/volumes?q=';

            // Construct query parts
            const queryPart = query.trim() || '';
            const categoryPart = activeCategory !== 'all' ? `subject:${activeCategory}` : '';

            // Combine parts: "query subject:category" or just one of them
            // If both are empty, we might search for something generic like "newest" if we wanted, 
            // but logic here requires at least one.
            if (!queryPart && !categoryPart) {
                setLoading(false);
                return;
            }

            const combinedQuery = `${queryPart} ${categoryPart}`.trim();
            const finalQuery = encodeURIComponent(combinedQuery);

            const response = await fetch(`${searchUrl}${finalQuery}&startIndex=${index}&maxResults=20`);
            const data = await response.json();

            if (data.items) {
                if (isLoadMore) {
                    setResults(prev => [...prev, ...data.items]);
                } else {
                    setResults(data.items);
                }

                // If fewer items returned than requested, we reached the end
                if (data.items.length < 20) {
                    setHasMore(false);
                }
            } else {
                if (!isLoadMore) setResults([]);
                setHasMore(false);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch from Google Books');
        } finally {
            setLoading(false);
        }
    }

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        // Check if scrolled near bottom (within 50px)
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasMore && !loading && (query.trim() || activeCategory !== 'all')) {
                const nextIndex = startIndex + 20;
                setStartIndex(nextIndex);
                fetchBooks(nextIndex, true);
            }
        }
    };

    const searchBooks = (e) => {
        e.preventDefault();
        // Manual submit ensures search (logic handled in effect mostly, but robust here)
        if (query.trim() || activeCategory !== 'all') {
            setStartIndex(0);
            fetchBooks(0, false);
        }
    };

    const addBookToLibrary = async (book) => {
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
                    'Authorization': 'Basic ' + btoa('admin:password')
                },
                body: JSON.stringify(newBook)
            });

            if (response.ok) {
                setMessage({ text: `Added "${newBook.title}" to library!`, type: 'success' });
                if (onBookAdded) onBookAdded();
            } else {
                setMessage({ text: 'Failed to add book to library', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Error connecting to backend', type: 'error' });
        }
    };

    return (
        <div className="search-container">
            <div className="category-filters">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        type="button"
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <form onSubmit={searchBooks} className="search-form">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, author, isbn..."
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                    </svg>
                    Suchen
                </button>
            </form>

            {message && <p className={`message ${message.type}`}>{message.text}</p>}
            {error && <p className="error">{error}</p>}

            <div
                className="results-list"
                onScroll={handleScroll}
                style={{ display: (results.length > 0) ? 'flex' : 'none' }}
            >
                {results.map((book, index) => (
                    <div key={`${book.id}-${index}`} className="search-result-card">
                        <div className="result-img-wrapper">
                            {book.volumeInfo.imageLinks?.smallThumbnail ? (
                                <img src={book.volumeInfo.imageLinks.smallThumbnail} alt="" className="result-thumb" />
                            ) : (
                                <div className="result-thumb-placeholder">📚</div>
                            )}
                        </div>
                        <div className="result-info">
                            <div className="book-title">{book.volumeInfo.title}</div>
                            <span className="author">by {book.volumeInfo.authors?.join(', ')}</span>
                            {book.volumeInfo.publishedDate && <span className="search-date">{book.volumeInfo.publishedDate.substring(0, 4)}</span>}
                        </div>
                        <button onClick={() => addBookToLibrary(book)} className="add-button">
                            Add to Library
                        </button>
                    </div>
                ))}
                {loading && <div className="loading-more">Loading more...</div>}
                {!hasMore && results.length > 0 && <div className="end-message">No more results</div>}
            </div>
        </div>
    );
}

export default BookSearch;
