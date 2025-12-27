import { useState } from 'react';
import './BookSearch.css';

function BookSearch({ onBookAdded }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const searchBooks = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
            const data = await response.json();
            if (data.items) {
                setResults(data.items);
                setError(null);
            } else {
                setResults([]);
                setError('No books found');
            }
        } catch (err) {
            setError('Failed to fetch from Google Books');
        }
    };

    const addBookToLibrary = async (book) => {
        const volumeInfo = book.volumeInfo;
        const isbnInfo = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')
            || volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10');

        if (!isbnInfo) {
            setMessage('Cannot add book: No ISBN found');
            return;
        }

        const newBook = {
            title: volumeInfo.title,
            isbn: isbnInfo.identifier,
            authorName: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author'
        };

        try {
            // Note: This endpoint (POST /api/books) handles "find or create author" internally
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Basic ...' // TODO: Add auth handling if user is logged in
                    'Authorization': 'Basic ' + btoa('admin:password') // Hardcoded for demo, TODO: Use Context
                },
                body: JSON.stringify(newBook)
            });

            if (response.ok) {
                setMessage(`Added "${newBook.title}" to library!`);
                if (onBookAdded) onBookAdded(); // Refresh parent list
            } else {
                setMessage('Failed to add book to library');
            }
        } catch (err) {
            setMessage('Error connecting to backend');
        }
    };

    return (
        <div className="search-container">
            <h2>Add New Books</h2>
            <form onSubmit={searchBooks} className="search-form">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, author, isbn..."
                    className="search-input"
                />
                <button type="submit" className="search-button">Search Google Books</button>
            </form>

            {message && <p className="message">{message}</p>}
            {error && <p className="error">{error}</p>}

            <div className="results-list">
                {results.map(book => (
                    <div key={book.id} className="search-result-card">
                        <div className="result-info">
                            <strong>{book.volumeInfo.title}</strong>
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
