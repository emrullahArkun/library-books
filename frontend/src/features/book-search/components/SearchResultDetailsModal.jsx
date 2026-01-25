
import styles from './SearchResultDetailsModal.module.css';


const SearchResultDetailsModal = ({ isOpen, onClose, title, description }) => {


    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{title}</h2>
                    <button className={styles.modalCloseBtn} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>

                    <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{description}</p>
                </div>
            </div>
        </div>
    );
};

export default SearchResultDetailsModal;
