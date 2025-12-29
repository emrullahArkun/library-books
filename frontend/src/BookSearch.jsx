import { useState, useEffect } from 'react';
import './BookSearch.css';
import { FaSearch, FaBookOpen, FaFileAlt, FaTag, FaStar } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

function BookSearch({ onBookAdded }) {
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

            // If empty search, verify if we should return
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
    }

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
        console.log('Attempting to add book. Token:', token);
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
                    <FaSearch />
                    Suchen
                </button>
            </form>

            {message && <p className={`message ${message.type}`}>{message.text}</p>}
            {error && <p className="error">{error}</p>}



            <div className="results-grid">
                {results.map((book, index) => {
                    const info = book.volumeInfo;
                    return (
                        <div key={`${book.id}-${index}`} className="search-result-card">
                            <div className="card-header">
                                <div className="result-img-wrapper">
                                    {info.imageLinks?.thumbnail ? (
                                        <img src={info.imageLinks.thumbnail} alt="" className="result-thumb" />
                                    ) : (
                                        <div className="result-thumb-placeholder"><FaBookOpen size={24} color="#ccc" /></div>
                                    )}
                                </div>
                                <div className="card-basic-info">
                                    <div className="book-title">{info.title}</div>
                                    <div className="author">by {info.authors?.join(', ') || 'Unknown'}</div>
                                    {info.publishedDate && <div className="meta-date">{info.publishedDate}</div>}
                                    {info.publisher && <div className="meta-publisher">{info.publisher}</div>}
                                </div>
                            </div>

                            <div className="card-details">
                                {info.description && (
                                    <p className="description" title={info.description}>
                                        {info.description.length > 150
                                            ? info.description.substring(0, 150) + '...'
                                            : info.description}
                                    </p>
                                )}
                                <div className="meta-row">
                                    {info.pageCount && <span className="tag"><FaFileAlt /> {info.pageCount} p.</span>}
                                    {info.categories && (
                                        <span className="tag">
                                            <FaTag />
                                            {info.categories[0]}
                                        </span>
                                    )}
                                    {info.averageRating && <span className="tag"><FaStar color="#FFC107" /> {info.averageRating}</span>}
                                </div>
                            </div>



                            <button onClick={() => addBookToLibrary(book)} className="add-button">
                                Add to Library
                            </button>
                        </div>
                    )
                })}
            </div >

            {loading && <div className="loading-more">Loading...</div>}

            {
                results.length > 0 && hasMore && !loading && (
                    <button onClick={loadMore} className="load-more-btn">Load More Results</button>
                )
            }

            {!hasMore && results.length > 0 && <div className="end-message">End of results</div>}
        </div >
    );
}

export default BookSearch;
