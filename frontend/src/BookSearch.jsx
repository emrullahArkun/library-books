import { useState, useEffect } from 'react';
import './BookSearch.css';

function BookSearch({ onBookAdded }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    // Live search effect with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                fetchBooks(query);
            } else {
                setResults([]); // Clear results if query is empty
            }
        }, 300); // Wait 300ms (faster response)

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const fetchBooks = async (searchQuery) => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5`);
            const data = await response.json();
            if (data.items) {
                setResults(data.items);
                setError(null);
            } else {
                setResults([]);
                // Don't show error while typing, just empty list is fine or specific message
                setError(null);
            }
        } catch (err) {
            setError('Failed to fetch from Google Books');
        }
    }

    const searchBooks = (e) => {
        e.preventDefault();
        // Manual submit also triggers search immediately
        if (query.trim()) {
            fetchBooks(query);
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

            <div className="results-list">
                {results.map(book => (
                    <div key={book.id} className="search-result-card">
                        <div className="result-info">
                            <div className="book-title">{book.volumeInfo.title}</div>
                            <span className="author">by {book.volumeInfo.authors?.join(', ')}</span>
                        </div>
                        <button onClick={() => addBookToLibrary(book)} className="add-button">
                            Add to Library
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BookSearch;
