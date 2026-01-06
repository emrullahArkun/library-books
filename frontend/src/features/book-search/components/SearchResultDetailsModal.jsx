import React from 'react';
import styles from './SearchResultDetailsModal.module.css';
import { useTranslation } from 'react-i18next';

const SearchResultDetailsModal = ({ isOpen, onClose, title, description }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{title}</h2>
                    <button className={styles.modalCloseBtn} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <span className={styles.modalLabel}>{t('search.result.description')}:</span>
                    <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{description}</p>
                </div>
            </div>
        </div>
    );
};

export default SearchResultDetailsModal;
