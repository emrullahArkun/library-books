import React from 'react';
import { FaBookOpen, FaFileAlt, FaTag, FaStar, FaPlus } from 'react-icons/fa';
import { motion, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@chakra-ui/react';
import '../BookSearch.css';
import { formatPublishedDate } from '../../../utils/formatDate';
import SearchResultDetailsModal from './SearchResultDetailsModal';

const SearchResultCard = ({ book, onAdd }) => {
    const { t } = useTranslation();
    const info = book.volumeInfo;
    const controls = useAnimation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleMouseEnter = () => {
        controls.start({
            scale: 30,
            opacity: 0.1,
            transition: { duration: 0.5, ease: "easeOut" }
        });
    };

    const handleMouseLeave = () => {
        controls.start({
            scale: 0,
            opacity: 0,
            transition: { duration: 0.3, ease: "easeIn" }
        });
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
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
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
                    <div className="card-header">
                        <div className="result-img-wrapper">
                            {info.imageLinks?.thumbnail ? (
                                <img src={info.imageLinks.thumbnail} alt={info.title} className="result-thumb" />
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

                    <div className="card-action-footer">
                        <span className="add-text">{t('search.result.addToLibrary')}</span>
                        <span className="plus-icon"><FaPlus size={10} /></span>
                    </div>
                </div>

                {/* Wave Animation Layer */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={controls}
                    style={{
                        position: 'absolute',
                        bottom: '-25px',
                        right: '-25px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: '#319795', // Teal color
                        zIndex: 1,
                        pointerEvents: 'none',
                        transformOrigin: 'center'
                    }}
                />
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
