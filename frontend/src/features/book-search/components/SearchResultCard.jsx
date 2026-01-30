import { useState, useRef } from 'react';
import { FaPlus, FaSpinner, FaBookOpen } from 'react-icons/fa';

import styles from './SearchResultCard.module.css';
import { useAnimation } from '../../../context/AnimationContext';
import BookCover from '../../../ui/BookCover';

const SearchResultCard = ({ book, onAdd, ownedIsbns }) => {
    // const { t } = useTranslation();
    const info = book.volumeInfo;
    const [isAdding, setIsAdding] = useState(false);

    const { flyBook } = useAnimation();
    const imageRef = useRef(null);

    const handleAddClick = async (e) => {
        e.stopPropagation();
        if (isAdding) return;

        // Check if already owned
        const identifiers = info.industryIdentifiers || [];
        const isOwned = identifiers.some(id => {
            const cleanId = id.identifier.replace(/-/g, '');
            return ownedIsbns?.has(cleanId);
        }) || ownedIsbns?.has(`ID:${book.id}`);

        // Start animation immediately ONLY if not owned
        if (!isOwned && imageRef.current) {
            const imageSrc = imageRef.current.src || imageRef.current.querySelector?.('img')?.src;
            flyBook(imageRef.current.getBoundingClientRect(), imageSrc);
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
                <BookCover
                    ref={imageRef}
                    book={book}
                    className={styles.coverImage}
                    borderRadius="12px"
                    fallbackIconSize={48}
                    fallbackIcon={FaBookOpen}
                    w="100%"
                    h="100%"
                />

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
