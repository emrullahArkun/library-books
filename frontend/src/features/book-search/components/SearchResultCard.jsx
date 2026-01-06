import React from 'react';
import { FaBookOpen, FaFileAlt, FaTag, FaStar, FaPlus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import styles from './SearchResultCard.module.css';
import { formatPublishedDate } from '../../../utils/formatDate';
import { getHighResImage } from '../../../utils/googleBooks';
import SearchResultDetailsModal from './SearchResultDetailsModal';

const SearchResultCard = ({ book, onAdd }) => {
    const { t } = useTranslation();
    const info = book.volumeInfo;
    const [isOpen, setIsOpen] = useState(false);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const initialThumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    const safeUrl = initialThumb ? getHighResImage(initialThumb) : '';

    const [imgSrc, setImgSrc] = React.useState(safeUrl);

    const handleImageError = () => {
        // Fallback logic could go here if we had an alternative source
    };

    const handleShowMore = (e) => {
        e.stopPropagation();
        onOpen();
    };

    const description = info.description || '';
    const isLongDescription = description.length > 150;
    const shortDescription = isLongDescription ? description.substring(0, 150) + '...' : description;
    const published = formatPublishedDate(info.publishedDate);

    return (
        <>
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
                <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

                    <div className={styles.cardUpperSection}>
                        <div className={styles.cardHeader}>
                            <div className={styles.resultImgWrapper}>
                                {initialThumb ? (
                                    <img
                                        src={imgSrc}
                                        onError={handleImageError}
                                        alt={info.title}
                                        className={styles.resultThumb}
                                    />
                                ) : (
                                    <div className={styles.resultThumbPlaceholder}><FaBookOpen size={24} color="#ccc" /></div>
                                )}
                            </div>
                            <div className={styles.cardBasicInfo}>
                                <div className={styles.bookTitle}>{info.title}</div>
                                <div className={styles.author}>{t('search.result.by')} {info.authors?.join(', ') || t('search.result.unknown')}</div>
                                {published && <div className={styles.metaDate}>{published}</div>}
                                {info.publisher && <div className={styles.metaPublisher}>{info.publisher}</div>}
                            </div>
                        </div>

                        <div className={styles.cardDetails}>
                            {description && (
                                <div className={styles.descriptionContainer} style={{ textAlign: 'left' }}>
                                    <p className={styles.description}>
                                        {shortDescription}
                                    </p>
                                    {isLongDescription && (
                                        <button
                                            type="button"
                                            className={styles.showMoreBtn}
                                            onClick={handleShowMore}
                                            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {t('search.result.showMore')}
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className={styles.metaRow}>
                                {info.pageCount && <span className={styles.tag}><FaFileAlt /> {info.pageCount} {t('search.result.pages')}</span>}
                                {info.categories && (
                                    <span className={styles.tag}>
                                        <FaTag />
                                        {info.categories[0]}
                                    </span>
                                )}
                                {info.averageRating && <span className={styles.tag}><FaStar color="#FFC107" /> {info.averageRating}</span>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.cardActionFooter}>
                        <span className="add-text">{t('search.result.addToLibrary')}</span>
                        <span className={styles.plusIcon}><FaPlus size={10} /></span>
                    </div>
                </div>
            </div>

            <SearchResultDetailsModal
                isOpen={isOpen}
                onClose={onClose}
                title={info.title}
                description={description}
            />
        </>
    );
};

export default SearchResultCard;
