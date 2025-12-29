import { useState } from 'react';

const UpdateProgressModal = ({ book, onClose, onUpdate }) => {
    const [page, setPage] = useState(book.currentPage || 0);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const pageNum = parseInt(page);

        if (pageNum < 0) {
            setError('Page number cannot be negative');
            return;
        }
        if (book.pageCount && pageNum > book.pageCount) {
            setError(`Page number cannot exceed ${book.pageCount}`);
            return;
        }

        onUpdate(book.id, pageNum);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Update Progress for "{book.title}"</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current Page:</label>
                        <input
                            type="number"
                            value={page}
                            onChange={(e) => setPage(e.target.value)}
                            min="0"
                            max={book.pageCount}
                        />
                        {book.pageCount > 0 && (
                            <small>of {book.pageCount} pages</small>
                        )}
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Save Progress</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProgressModal;
