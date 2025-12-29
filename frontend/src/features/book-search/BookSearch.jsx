import React from 'react';
import './BookSearch.css';
import { useBookSearch } from './hooks/useBookSearch';
import SearchForm from './components/SearchForm';
import SearchResultCard from './components/SearchResultCard';

function BookSearch({ onBookAdded }) {
    const {
        query, setQuery,
        results,
        error,
        message,
        hasMore,
        loading,
        searchBooks,
        loadMore,
        addBookToLibrary
    } = useBookSearch();

    const handleAddBook = async (book) => {
        const success = await addBookToLibrary(book);
        if (success && onBookAdded) {
            onBookAdded();
        }
    };

    return (
        <div className="search-container">
            <SearchForm query={query} setQuery={setQuery} onSearch={searchBooks} />

            {message && <p className={`message ${message.type}`}>{message.text}</p>}
            {error && <p className="error">{error}</p>}

            <div className="results-grid">
                {results.map((book, index) => (
                    <SearchResultCard
                        key={`${book.id}-${index}`}
                        book={book}
                        onAdd={handleAddBook}
                    />
                ))}
            </div>

            {loading && <div className="loading-more">Loading...</div>}

            {results.length > 0 && hasMore && !loading && (
                <button onClick={loadMore} className="load-more-btn">Load More Results</button>
            )}

            {!hasMore && results.length > 0 && <div className="end-message">End of results</div>}
        </div>
    );
}

export default BookSearch;
