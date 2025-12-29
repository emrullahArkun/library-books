import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const UpdateProgressModal = ({ book, onClose, onUpdate }) => {
    const { t } = useTranslation();
    const [page, setPage] = useState(book.currentPage || 0);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const pageNum = parseInt(page);

        if (pageNum < 0) {
            setError(t('modal.error.negative'));
            return;
        }
        if (book.pageCount && pageNum > book.pageCount) {
            setError(t('modal.error.exceed', { count: book.pageCount }));
            return;
        }

        onUpdate(book.id, pageNum);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{t('modal.title', { title: book.title })}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('modal.currentPage')}:</label>
                        <input
                            type="number"
                            value={page}
                            onChange={(e) => setPage(e.target.value)}
                            min="0"
                            max={book.pageCount}
                        />
                        {book.pageCount > 0 && (
                            <small>{t('modal.totalPages', { count: book.pageCount })}</small>
                        )}
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">{t('modal.cancel')}</button>
                        <button type="submit" className="save-btn">{t('modal.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProgressModal;
