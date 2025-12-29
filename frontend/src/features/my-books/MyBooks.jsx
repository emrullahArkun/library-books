import React from 'react';
import { FaTrash, FaTrashAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './MyBooks.css';
import { useMyBooks } from './hooks/useMyBooks';
import MyBookCard from './components/MyBookCard';

function MyBooks() {
    const { t } = useTranslation();
    const {
        books,
        loading,
        error,
        selectedBooks,
        toggleSelection,
        deleteBook, // Not used in layout directly anymore, but available if needed for single delete actions on card
        deleteSelected,
        deleteAll,
        updateBookProgress,
        updateBookStatus
    } = useMyBooks();

    if (loading) return <div className="loading">Loading library...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="my-books-container">
            <div className="header-actions">
                <h1>{t('myBooks.title')}</h1>
                <div className="action-buttons">
                    <button
                        onClick={deleteSelected}
                        disabled={selectedBooks.size === 0}
                        className="delete-btn"
                    >
                        <FaTrash /> {t('myBooks.deleteSelected')} ({selectedBooks.size})
                    </button>
                    <button onClick={deleteAll} className="delete-all-btn">
                        <FaTrashAlt /> {t('myBooks.deleteAll')}
                    </button>
                </div>
            </div>

            <div className="books-grid">
                {books.length === 0 && (
                    <div className="empty-state">
                        <p>{t('myBooks.empty.line1')}</p>
                        <p>{t('myBooks.empty.line2')}</p>
                    </div>
                )}
                {books.map(book => (
                    <MyBookCard
                        key={book.id}
                        book={book}
                        isSelected={selectedBooks.has(book.id)}
                        onToggleSelect={toggleSelection}
                        onUpdateProgress={updateBookProgress}
                        onUpdateStatus={updateBookStatus}
                    />
                ))}
            </div>
        </div>
    );
}

export default MyBooks;
