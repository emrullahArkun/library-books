import React from 'react';

import { useTranslation } from 'react-i18next';

const SearchResultDetailsModal = ({ isOpen, onClose, title, description }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <span className="modal-label">{t('search.result.description')}:</span>
                    <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{description}</p>
                </div>
            </div>
        </div>
    );
};

export default SearchResultDetailsModal;
