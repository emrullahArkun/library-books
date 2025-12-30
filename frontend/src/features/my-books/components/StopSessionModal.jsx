import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './StopSessionModal.css';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaTimes } from 'react-icons/fa';

const StopSessionModal = ({ isOpen, onClose, onConfirm, currentBookPage, maxPages }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [page, setPage] = useState(currentBookPage || 0);

    if (!isOpen) return null;

    const handleConfirmFinished = () => {
        setStep(2);
    };

    const handleConfirmPage = () => {
        const pageNum = parseInt(page, 10);
        if (maxPages && pageNum > maxPages) {
            alert(t('readingSession.stopModal.maxPagesError', { count: maxPages }));
            return;
        }
        onConfirm(pageNum);
        setStep(1); // Reset for next time
    };

    const handleClose = () => {
        setStep(1);
        onClose();
    };

    const modalContent = (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={handleClose}>×</button>

                {step === 1 && (
                    <>
                        <h3>{t('readingSession.stopModal.title')}</h3>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={handleConfirmFinished}>
                                <FaCheck /> {t('readingSession.stopModal.confirm')}
                            </button>
                            <button className="btn-secondary" onClick={handleClose}>
                                <FaTimes /> {t('readingSession.stopModal.cancel')}
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h3>{t('readingSession.stopModal.pageTitle')}</h3>
                        <input
                            type="number"
                            className="page-input"
                            value={page}
                            onChange={(e) => setPage(e.target.value)}
                            min={currentBookPage}
                            max={maxPages}
                        />
                        {maxPages && <p className="max-pages-hint">{t('readingSession.stopModal.maxPagesHint', { count: maxPages })}</p>}

                        <div className="modal-actions">
                            <button className="btn-primary" onClick={handleConfirmPage}>
                                <FaCheck /> {t('readingSession.stopModal.submit')}
                            </button>
                            <button className="btn-secondary" onClick={handleClose}>
                                <FaTimes /> {t('readingSession.stopModal.abort')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default StopSessionModal;
