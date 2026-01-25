import { useCallback } from 'react';
import styles from './BookSearch.module.css';
import { useBookSearch } from './hooks/useBookSearch.jsx';
import SearchForm from './components/SearchForm';
import SearchResultCard from './components/SearchResultCard';
import SearchResultSkeleton from './components/SearchResultSkeleton';
import { useTranslation } from 'react-i18next';

function BookSearch({ onBookAdded }) {
    const { t } = useTranslation();
    const {
        query, setQuery,
        results,
        error,
        hasMore,
        loading,
        searchBooks,
        loadMore,
        addBookToLibrary,
        ownedIsbns
    } = useBookSearch();

    const handleAddBook = useCallback(async (book) => {
        try {
            const success = await addBookToLibrary(book);
            if (success && onBookAdded) {
                onBookAdded();
            }
        } catch (error) {
            // Error is handled by global onError toast in useBookSearch
        }
    }, [addBookToLibrary, onBookAdded]);

    return (
        <div className={styles.searchContainer}>
            <SearchForm query={query} setQuery={setQuery} onSearch={searchBooks} />

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.resultsGrid}>
                {results.map((book) => (
                    <SearchResultCard
                        key={book.id}
                        book={book}
                        onAdd={handleAddBook}
                        ownedIsbns={ownedIsbns}
                    />
                ))}

                {loading && Array.from({ length: 10 }).map((_, index) => (
                    <SearchResultSkeleton key={`skeleton-${index}`} />
                ))}
            </div>

            {results.length > 0 && hasMore && !loading && (
                <button onClick={loadMore} className={styles.loadMoreBtn}>{t('search.loadMore')}</button>
            )}

            {!hasMore && results.length > 0 && <div className={styles.endMessage}>{t('search.endResults')}</div>}
        </div>
    );
}

export default BookSearch;
