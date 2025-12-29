import React, { useState } from 'react';
import './StopSessionModal.css';
import { useTranslation } from 'react-i18next';

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

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={handleClose}>×</button>

                {step === 1 && (
                    <>
                        <h3>{t('readingSession.stopModal.title')}</h3>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={handleConfirmFinished}>{t('readingSession.stopModal.confirm')}</button>
                            <button className="btn-secondary" onClick={handleClose}>{t('readingSession.stopModal.cancel')}</button>
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
                            <button className="btn-primary" onClick={handleConfirmPage}>{t('readingSession.stopModal.submit')}</button>
                            <button className="btn-secondary" onClick={handleClose}>{t('readingSession.stopModal.abort')}</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StopSessionModal;
