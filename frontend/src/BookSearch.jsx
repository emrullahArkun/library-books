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

    // Effect only for category change if we want it to auto-trigger? 
    // User asked for "manual trigger" essentially. 
    // To match "results ... load ... after click on search", we should NOT trigger on category change automatically 
    // UNLESS the user expects category filters to apply immediately. 
    // Usually category filters are live. Let's make them part of the search query but only trigger when "Search" is clicked?
    // OR: Trigger search immediately when Category is clicked (common pattern). 
    // The prompt says "results ... not live load ... but after click on search".
    // I will implement it such that changing category sets the state, but fetch is manual. 
    // However, for UX, clicking a category usually refreshes results. I'll stick to strict interpretation: Manual, or only manual for text?
    // "not live load ... but after click on search (or Enter)" implies the text input mostly.
    // Let's safe bet: Category click triggers search immediately (it's a click interaction), text typing does not.

    useEffect(() => {
        // Only trigger search if activeCategory changes (and it's not the initial mount potentially, or just let it be)
        // But wait, the user said "Results loaded ... after click on search". 
        // If I make category click trigger search, that complies with "click".
        // UseEffect to reset results when category changes? No, let's keep it simple.
        // We will just clear results if they become invalid? No.
        // Let's remove the live search useEffect entirely.
    }, []);

    const fetchBooks = async (index, isLoadMore) => {
        if (loading) return;
        setLoading(true);
        try {
            let searchUrl = 'https://www.googleapis.com/books/v1/volumes?q=';
            const queryPart = query.trim() || '';
            const categoryPart = activeCategory !== 'all' ? `subject:${activeCategory}` : '';

            // If empty search, verify if we should return
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
                if (data.items.length < 20) setHasMore(false);
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

    // Trigger search when category changes? 
    // Let's do it. It feels broken otherwise if you click "Fiction" and nothing happens.
    useEffect(() => {
        if (activeCategory !== 'all' || query) {
            // We can trigger it, but let's respect "not live". 
            // Actually, clicking a category IS a "search action". 
            // Typing is what usually annoys people with "live" search.
            searchBooks();
        }
    }, [activeCategory]);

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
                                        <div className="result-thumb-placeholder">📚</div>
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
                                    {info.pageCount && <span className="tag">📄 {info.pageCount} p.</span>}
                                    {info.categories && <span className="tag">🏷️ {info.categories[0]}</span>}
                                    {info.averageRating && <span className="tag">⭐ {info.averageRating}</span>}
                                </div>
                            </div>

                            <div className="links-row">
                                <span style={{ width: '100%', fontSize: '0.8em', color: '#999', marginBottom: '4px' }}>Links:</span>
                                {book.accessInfo?.webReaderLink && (
                                    <a href={book.accessInfo.webReaderLink} target="_blank" rel="noopener noreferrer" className="link-chip">
                                        📖 Reader
                                    </a>
                                )}
                                {info.previewLink && (
                                    <a href={info.previewLink} target="_blank" rel="noopener noreferrer" className="link-chip">
                                        👀 Preview
                                    </a>
                                )}
                                {info.infoLink && (
                                    <a href={info.infoLink} target="_blank" rel="noopener noreferrer" className="link-chip">
                                        ℹ️ Info
                                    </a>
                                )}
                                {info.canonicalVolumeLink && (
                                    <a href={info.canonicalVolumeLink} target="_blank" rel="noopener noreferrer" className="link-chip">
                                        🔗 Canonical
                                    </a>
                                )}
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
