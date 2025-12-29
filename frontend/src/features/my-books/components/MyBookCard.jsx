import React, { useState } from 'react';
import '../MyBooks.css';
import UpdateProgressModal from './UpdateProgressModal';

const MyBookCard = ({ book, isSelected, onToggleSelect, onUpdateProgress }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const calculateEstimate = () => {
        if (!book.startDate || !book.currentPage || !book.pageCount) return null;

        const start = new Date(book.startDate);
        const now = new Date();
        const daysSinceStart = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24))); // Avoid div by 0

        if (book.currentPage === 0) return null;

        const pagesPerDay = book.currentPage / daysSinceStart;
        const pagesLeft = book.pageCount - book.currentPage;
        const daysLeft = Math.ceil(pagesLeft / pagesPerDay);

        if (daysLeft <= 0) return "Finished!";

        const finishDate = new Date();
        finishDate.setDate(finishDate.getDate() + daysLeft);

        return `Est. finish: ${finishDate.toLocaleDateString()} (${daysLeft} days)`;
    };

    const handleUpdate = (id, page) => {
        onUpdateProgress(id, page);
        setIsModalOpen(false);
    };

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

                {book.pageCount > 0 ? (
                    <div className="progress-section">
                        <progress value={book.currentPage || 0} max={book.pageCount}></progress>
                        <div className="progress-stats">
                            Read {book.currentPage || 0} of {book.pageCount} pages
                        </div>
                        {calculateEstimate() && (
                            <div className="progress-prediction">
                                {calculateEstimate()}
                            </div>
                        )}
                        <button
                            className="update-progress-btn"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Update Progress
                        </button>
                    </div>
                ) : (
                    <p className="isbn">Pages: Unknown</p> // Fallback if no page count
                )}
            </div>

            {isModalOpen && (
                <UpdateProgressModal
                    book={book}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
};

export default MyBookCard;
