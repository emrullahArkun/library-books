import { useState, useEffect } from 'react';
import './MyBooks.css';

function MyBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
    }, []);

    if (loading) return <div className="loading">Loading library...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="my-books-container">
            <h1>My Library</h1>
            <div className="books-grid">
                {books.map(book => (
                    <div key={book.id} className="book-card-detail">
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
