import React from 'react';
import { FaTrash, FaTrashAlt } from 'react-icons/fa';
import './MyBooks.css';
import { useMyBooks } from './hooks/useMyBooks';
import MyBookCard from './components/MyBookCard';

function MyBooks() {
    const {
        books,
        loading,
        error,
        selectedBooks,
        toggleSelection,
        deleteBook, // Not used in layout directly anymore, but available if needed for single delete actions on card
        deleteSelected,
        deleteAll
    } = useMyBooks();

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
                        <FaTrash /> Delete Selected ({selectedBooks.size})
                    </button>
                    <button onClick={deleteAll} className="delete-all-btn">
                        <FaTrashAlt /> Delete All
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
                    <MyBookCard
                        key={book.id}
                        book={book}
                        isSelected={selectedBooks.has(book.id)}
                        onToggleSelect={toggleSelection}
                    />
                ))}
            </div>
        </div>
    );
}

export default MyBooks;
