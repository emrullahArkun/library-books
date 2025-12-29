import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../MyBooks.css';
import UpdateProgressModal from './UpdateProgressModal';

const MyBookCard = ({ book, isSelected, onToggleSelect, onUpdateProgress, onUpdateStatus }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const calculateEstimate = () => {
        if (book.completed) return t('bookCard.finished');
        if (!book.startDate || !book.currentPage || !book.pageCount) return null;

        const start = new Date(book.startDate);
        const now = new Date();
        const daysSinceStart = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24))); // Avoid div by 0

        if (book.currentPage === 0) return null;

        const pagesPerDay = book.currentPage / daysSinceStart;
        const pagesLeft = book.pageCount - book.currentPage;
        const daysLeft = Math.ceil(pagesLeft / pagesPerDay);

        if (daysLeft <= 0) return t('bookCard.finished');

        const finishDate = new Date();
        finishDate.setDate(finishDate.getDate() + daysLeft);

        return t('bookCard.estFinish', { date: finishDate.toLocaleDateString(), days: daysLeft });
    };

    const handleUpdate = (id, page) => {
        onUpdateProgress(id, page);
        setIsModalOpen(false);
    };

    return (
        <div className={`book-card-detail ${isSelected ? 'selected' : ''} ${book.completed ? 'completed' : ''}`}>
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
                    <div className="no-cover">{t('bookCard.noCover')}</div>
                )}
            </div>
            <div className="book-info">
                <h3>{book.title}</h3>
                <p className="author">{t('bookCard.by')} {book.authorName}</p>

                <div className="status-toggle">
                    <label>
                        <input
                            type="checkbox"
                            checked={book.completed || false}
                            onChange={(e) => onUpdateStatus(book.id, e.target.checked)}
                        />
                        {t('bookCard.markAsRead')}
                    </label>
                </div>

                {book.pageCount > 0 ? (
                    <div className="progress-section">
                        <progress value={book.currentPage || 0} max={book.pageCount}></progress>
                        <div className="progress-stats">
                            {t('bookCard.readProgress', { current: book.currentPage || 0, total: book.pageCount })}
                        </div>
                        {calculateEstimate() && (
                            <div className="progress-prediction">
                                {calculateEstimate()}
                            </div>
                        )}
                        {!book.completed && (
                            <button
                                className="update-progress-btn"
                                onClick={() => setIsModalOpen(true)}
                            >
                                {t('bookCard.updateProgress')}
                            </button>
                        )}
                    </div>
                ) : (
                    <p className="isbn">{t('bookCard.pagesUnknown')}</p> // Fallback if no page count
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
