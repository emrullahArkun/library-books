import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../MyBooks.css';
import UpdateProgressModal from './UpdateProgressModal';
import StopSessionModal from './StopSessionModal';

const MyBookCard = ({
    book,
    isSelected,
    onToggleSelect,
    onUpdateProgress,
    onUpdateStatus,
    activeSession,
    onStartSession,
    onStopSession,
    onExcludeTime,
    timerTime
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStopModalOpen, setIsStopModalOpen] = useState(false);

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

    const [frozenTimerDisplay, setFrozenTimerDisplay] = useState(null);
    const [stopTime, setStopTime] = useState(null);

    const handleStopClick = () => {
        setStopTime(new Date());
        setFrozenTimerDisplay(timerTime);
        setIsStopModalOpen(true);
    };

    const handleStopConfirm = (newPage) => {
        const pagesRead = newPage - (book.currentPage || 0);
        onUpdateProgress(book.id, newPage);
        onStopSession(stopTime, newPage); // Pass frozen time AND endPage
        setIsStopModalOpen(false);
        setFrozenTimerDisplay(null);
        if (pagesRead > 0) {
            alert(t('readingSession.pagesReadAlert', { pages: pagesRead }));
        }
    };

    const handleStopCancel = () => {
        if (stopTime) {
            const now = new Date();
            const diff = now.getTime() - stopTime.getTime();
            if (diff > 1000 && typeof onExcludeTime === 'function') { // Only if more than 1s passed
                try {
                    onExcludeTime(diff);
                } catch (error) {
                    console.error("Error calling onExcludeTime", error);
                }
            }
        }
        setIsStopModalOpen(false);
        setFrozenTimerDisplay(null);
        setStopTime(null);
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

            <div className="book-cover-container" onClick={() => window.location.href = `/books/${book.id}/stats`} style={{ cursor: 'pointer' }}>
                <div className="book-cover">
                    {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} />
                    ) : (
                        <div className="no-cover">{t('bookCard.noCover')}</div>
                    )}
                    {book.completed && (
                        <div className="completed-overlay">
                            <div className="completed-badge">
                                {t('bookCard.finished')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="book-progress-info">
                {book.pageCount > 0 ? (
                    <div className="progress-section">
                        <progress value={book.currentPage || 0} max={book.pageCount}></progress>
                        <div className="progress-stats">
                            {t('bookCard.readProgress', { current: book.currentPage || 0, total: book.pageCount })}
                        </div>

                        {!book.completed && (
                            <div className="card-actions centered-action">
                                {activeSession?.bookId === book.id ? (
                                    <button
                                        className="timer-btn stop"
                                        onClick={handleStopClick}
                                    >
                                        {t('readingSession.stop')} {frozenTimerDisplay || timerTime}
                                    </button>
                                ) : (
                                    <button
                                        className="timer-btn start"
                                        onClick={async () => {
                                            const success = await onStartSession(book.id);
                                            if (!success) alert(t('readingSession.failedStart'));
                                        }}
                                        disabled={!!activeSession}
                                        title={activeSession ? t('readingSession.finishOther') : t('readingSession.startReading')}
                                    >
                                        {t('readingSession.start')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="isbn">{t('bookCard.pagesUnknown')}</p>
                )}
            </div>

            {isModalOpen && (
                <UpdateProgressModal
                    book={book}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={handleUpdate}
                />
            )}

            {isStopModalOpen && (
                <StopSessionModal
                    isOpen={isStopModalOpen}
                    onClose={handleStopCancel}
                    onConfirm={handleStopConfirm}
                    currentBookPage={book.currentPage || 0}
                    maxPages={book.pageCount}
                />
            )}
        </div>
    );
};

export default MyBookCard;
