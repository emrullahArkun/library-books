import { useState, useEffect } from 'react';
import './MyBooks.css';

function MyBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState(new Set());

    const fetchBooks = () => {
        setLoading(true);
        fetch('/api/books', {
            headers: {
                'Authorization': 'Basic ' + btoa('admin:password')
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
        fetchBooks();
    }, []);

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
                headers: { 'Authorization': 'Basic ' + btoa('admin:password') }
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

        // Parallel deletes for simplicity as we don't have a batch delete endpoint yet
        // OR we can add a batch delete endpoint. But user asked for functionality first.
        // Actually, user said 'delete selected'. Looping DELETE is fine for now.
        const promises = Array.from(selectedBooks).map(id =>
            fetch(`/api/books/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Basic ' + btoa('admin:password') }
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
                headers: { 'Authorization': 'Basic ' + btoa('admin:password') }
            });
            if (res.ok) {
                setBooks([]);
                setSelectedBooks(new Set());
            }
        } catch (error) {
            console.error('Failed to delete all books', error);
        }
    };

    if (loading) return <div className="loading">Loading library...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="my-books-container">
            <div className="header-actions">
                <h1>My Library</h1>
                <div className="action-buttons">
                    <button
                        onClick={deleteSelected}
                        disabled={selectedBooks.size === 0}
                        className="delete-btn"
                    >
                        Delete Selected ({selectedBooks.size})
                    </button>
                    <button onClick={deleteAll} className="delete-all-btn">
                        Delete All
                    </button>
                </div>
            </div>

            <div className="books-grid">
                {books.length === 0 && (
                    <div className="empty-state">
                        <p>No books in your library yet.</p>
                        <p>Go to Home to add books!</p>
                    </div>
                )}
                {books.map(book => (
                    <div key={book.id} className={`book-card-detail ${selectedBooks.has(book.id) ? 'selected' : ''}`}>
                        <div className="selection-overlay">
                            <input
                                type="checkbox"
                                checked={selectedBooks.has(book.id)}
                                onChange={() => toggleSelection(book.id)}
                            />
                        </div>
                        <div className="book-cover">
                            {book.coverUrl ? (
                                <img src={book.coverUrl} alt={book.title} />
                            ) : (
                                <div className="no-cover">No Cover</div>
                            )}
                        </div>
                        <div className="book-info">
                            <h3>{book.title}</h3>
                            <p className="author">by {book.authorName}</p>
                            <p className="isbn">ISBN: {book.isbn}</p>
                            {book.publishDate && <p className="date">Published: {book.publishDate}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyBooks;
