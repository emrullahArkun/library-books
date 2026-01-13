import React from 'react';
import { FaBookOpen, FaPlus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import styles from './SearchResultCard.module.css';
import { getHighResImage } from '../../../utils/googleBooks';

const SearchResultCard = ({ book, onAdd }) => {
    const { t } = useTranslation();
    const info = book.volumeInfo;

    const initialThumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    const safeUrl = initialThumb ? getHighResImage(initialThumb) : '';

    const [imgSrc, setImgSrc] = React.useState(safeUrl);

    const handleImageError = () => {
        // Fallback or placeholder could go here
    };

    return (
        <div
            className={styles.searchResultCard}
            onClick={() => onAdd(book)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAdd(book);
                }
            }}
        >
            <div className={styles.imageContainer}>
                {initialThumb ? (
                    <img
                        src={imgSrc}
                        onError={handleImageError}
                        alt={info.title}
                        className={styles.coverImage}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <FaBookOpen size={48} color="#ccc" />
                    </div>
                )}

                <div className={styles.hoverOverlay}>
                    <FaPlus className={styles.plusIcon} />
                </div>
            </div>
        </div>
    );
};

export default SearchResultCard;
