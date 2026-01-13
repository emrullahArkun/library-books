import React, { useState } from 'react';
import { FaBookOpen, FaPlus, FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import styles from './SearchResultCard.module.css';
import { getHighResImage } from '../../../utils/googleBooks';
import { useAnimation } from '../../../context/AnimationContext';

const SearchResultCard = ({ book, onAdd, ownedIsbns }) => {
    const { t } = useTranslation();
    const info = book.volumeInfo;
    const [isAdding, setIsAdding] = useState(false);

    const initialThumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    const safeUrl = initialThumb ? getHighResImage(initialThumb) : '';

    const [imgSrc, setImgSrc] = React.useState(safeUrl);
    const { flyBook } = useAnimation();
    const imageRef = React.useRef(null);

    const handleImageError = () => {
        // Fallback or placeholder could go here
    };

    const handleAddClick = async (e) => {
        e.stopPropagation();
        if (isAdding) return;

        // Check if already owned
        const identifiers = info.industryIdentifiers || [];
        const isOwned = identifiers.some(id => {
            const cleanId = id.identifier.replace(/-/g, '');
            return ownedIsbns?.has(cleanId);
        });

        // Start animation immediately ONLY if not owned
        if (!isOwned && imageRef.current) {
            flyBook(imageRef.current.getBoundingClientRect(), imgSrc);
        }

        setIsAdding(true);
        try {
            await onAdd(book);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div
            className={styles.searchResultCard}
            onClick={handleAddClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAddClick(e);
                }
            }}
        >
            <div className={styles.imageContainer}>
                {initialThumb ? (
                    <img
                        ref={imageRef}
                        src={imgSrc}
                        onError={handleImageError}
                        alt={info.title}
                        className={styles.coverImage}
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <FaBookOpen size={48} color="#ccc" />
                    </div>
                )}

                <div className={styles.hoverOverlay}>
                    {isAdding ? (
                        <FaSpinner className={`${styles.plusIcon} ${styles.spinning}`} />
                    ) : (
                        <FaPlus className={styles.plusIcon} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResultCard;
