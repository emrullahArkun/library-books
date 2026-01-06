import React from 'react';
import { FaBookOpen, FaFileAlt, FaTag, FaStar, FaPlus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import '../BookSearch.css';
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
                className="search-result-card"
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

                    <div className="card-upper-section">
                        <div className="card-header">
                            <div className="result-img-wrapper">
                                {initialThumb ? (
                                    <img
                                        src={imgSrc}
                                        onError={handleImageError}
                                        alt={info.title}
                                        className="result-thumb"
                                    />
                                ) : (
                                    <div className="result-thumb-placeholder"><FaBookOpen size={24} color="#ccc" /></div>
                                )}
                            </div>
                            <div className="card-basic-info">
                                <div className="book-title">{info.title}</div>
                                <div className="author">{t('search.result.by')} {info.authors?.join(', ') || t('search.result.unknown')}</div>
                                {published && <div className="meta-date">{published}</div>}
                                {info.publisher && <div className="meta-publisher">{info.publisher}</div>}
                            </div>
                        </div>

                        <div className="card-details">
                            {description && (
                                <div className="description-container" style={{ textAlign: 'left' }}>
                                    <p className="description">
                                        {shortDescription}
                                    </p>
                                    {isLongDescription && (
                                        <button
                                            type="button"
                                            className="show-more-btn"
                                            onClick={handleShowMore}
                                            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {t('search.result.showMore')}
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="meta-row">
                                {info.pageCount && <span className="tag"><FaFileAlt /> {info.pageCount} {t('search.result.pages')}</span>}
                                {info.categories && (
                                    <span className="tag">
                                        <FaTag />
                                        {info.categories[0]}
                                    </span>
                                )}
                                {info.averageRating && <span className="tag"><FaStar color="#FFC107" /> {info.averageRating}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="card-action-footer">
                        <span className="add-text">{t('search.result.addToLibrary')}</span>
                        <span className="plus-icon"><FaPlus size={10} /></span>
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
