import React from 'react';
import { FaTrash, FaTrashAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './MyBooks.css';
import { useMyBooks } from './hooks/useMyBooks';
import { useReadingSession } from './hooks/useReadingSession';
import MyBookCard from './components/MyBookCard';

function MyBooks() {
    const { t } = useTranslation();
    const {
        books,
        loading,
        error,
        selectedBooks,
        toggleSelection,
        deleteBook,
        deleteSelected,
        deleteAll,
        updateBookProgress,
        updateBookStatus
    } = useMyBooks();

    const {
        activeSession,
        startSession,
        stopSession,
        formattedTime,
        excludeTimeFromSession,

    } = useReadingSession();

    if (loading) return <div className="loading">{t('myBooks.loading')}</div>;
    if (error) return <div className="error">{t('myBooks.error', { message: error })}</div>;

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
                        activeSession={activeSession}
                        onStartSession={startSession}
                        onStopSession={stopSession}
                        onExcludeTime={excludeTimeFromSession}
                        timerTime={formattedTime}
                    />
                ))}
            </div>
        </div>
    );
}

export default MyBooks;
