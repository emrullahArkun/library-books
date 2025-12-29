import React from 'react';
import '../MyBooks.css';

const MyBookCard = ({ book, isSelected, onToggleSelect }) => {
    return (
        <div className={`book-card-detail ${isSelected ? 'selected' : ''}`}>
            <div className="selection-overlay">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(book.id)}
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
    );
};

export default MyBookCard;
