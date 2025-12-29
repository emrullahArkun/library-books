import React, { useState } from 'react';
import { FaBookOpen, FaFileAlt, FaTag, FaStar, FaPlus } from 'react-icons/fa';
import { motion, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Text,
    Button
} from '@chakra-ui/react';
import '../BookSearch.css';

const SearchResultCard = ({ book, onAdd }) => {
    const { t } = useTranslation();
    const info = book.volumeInfo;
    const controls = useAnimation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleMouseEnter = () => {
        controls.start({
            scale: 30,
            opacity: 0.1, // Keep subtle overlay
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

    return (
        <>
            <div
                className="search-result-card"
                onClick={() => onAdd(book)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onAdd(book);
                }}
            >
                <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header">
                        <div className="result-img-wrapper">
                            {info.imageLinks?.thumbnail ? (
                                <img src={info.imageLinks.thumbnail} alt="" className="result-thumb" />
                            ) : (
                                <div className="result-thumb-placeholder"><FaBookOpen size={24} color="#ccc" /></div>
                            )}
                        </div>
                        <div className="card-basic-info">
                            <div className="book-title">{info.title}</div>
                            <div className="author">{t('search.result.by')} {info.authors?.join(', ') || t('search.result.unknown')}</div>
                            {info.publishedDate && (
                                <div className="meta-date">
                                    {(() => {
                                        const date = new Date(info.publishedDate);
                                        if (isNaN(date.getTime())) return info.publishedDate;
                                        // If it's just a year (e.g., "2005"), date parsing works, 
                                        // but if the string doesn't have hyphens, we might want to keep it as is or format carefully.
                                        // Google Books often returns "YYYY" or "YYYY-MM-DD".
                                        // If input is "YYYY", we probably just want to show "YYYY".
                                        if (info.publishedDate.length === 4) return info.publishedDate;

                                        return new Intl.DateTimeFormat('de-DE', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        }).format(date);
                                    })()}
                                </div>
                            )}
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
                                    <span
                                        className="show-more-btn"
                                        onClick={handleShowMore}
                                    >
                                        {t('search.result.showMore')}
                                    </span>
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

            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent>
                    <ModalHeader pr={10}>{info.title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Text fontWeight="bold" mb={2}>{t('search.result.description')}:</Text>
                        <Text whiteSpace="pre-wrap">{description}</Text>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default SearchResultCard;
