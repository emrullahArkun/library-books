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

    // Determine fallback URL from ISBN immediately
    let fallbackUrl = '';
    if (info.industryIdentifiers) {
        const isbnInfo = info.industryIdentifiers.find(id => id.type === 'ISBN_13')
            || info.industryIdentifiers.find(id => id.type === 'ISBN_10');
        if (isbnInfo) {
            const cleanIsbn = isbnInfo.identifier.replace(/-/g, '');
            fallbackUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
        }
    }

    // Heuristic: If Google says "readingModes.image: false", the cover might be a placeholder.
    // In that case, we prefer OpenLibrary if available.
    // If not "image mode", we consider OpenLibrary as PRIMARY, and Google as FALLBACK.
    const preferOpenLibrary = (info.readingModes?.image === false) && fallbackUrl;

    if (info.readingModes?.image === false) {
        console.debug('SearchResultCard: Placeholder detected via readingModes', {
            id: book.id,
            title: book.volumeInfo.title,
            readingModes: info.readingModes,
            fallbackUrl,
            preferOpenLibrary
        });
    }

    const safeUrl = preferOpenLibrary
        ? fallbackUrl
        : (initialThumb ? getHighResImage(initialThumb) : fallbackUrl);

    const [imgSrc, setImgSrc] = React.useState(safeUrl);
    const { flyBook } = useAnimation();
    const imageRef = React.useRef(null);

    const handleImageError = () => {
        // If we were using OpenLibrary and it failed:
        // 1. If we preferred it (because Google was suspect), revert to Google (it might be a placeholder but better than Broken Box)
        // 2. If it was our only hope, well, we stay broken.

        // If we were using Google and it failed:
        // 1. Try OpenLibrary.

        // Simply: Switch to the candidate we HAVEN'T tried, or just stop.

        // But my logic below was simple: Try fallbackUrl. 
        // We need to know what we are currently trying.

        const googleUrl = initialThumb ? getHighResImage(initialThumb) : '';

        if (imgSrc === fallbackUrl) {
            // We tried OpenLibrary and it failed.
            if (googleUrl && preferOpenLibrary) {
                // We preferred OpenLibrary but it failed. Fallback to Google (even if suspect).
                // Use functional update to avoid stale closure issues
                setImgSrc(prev => prev === fallbackUrl ? googleUrl : prev);
            }
        } else {
            // We were using Google (or something else) and it failed. Try OpenLibrary.
            if (fallbackUrl && imgSrc !== fallbackUrl) {
                setImgSrc(fallbackUrl);
            }
        }
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
                {imgSrc ? (
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
