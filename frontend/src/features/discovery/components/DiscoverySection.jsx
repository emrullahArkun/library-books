import { useState, useRef } from 'react';
import { FaPen, FaBook, FaSearch, FaPlus, FaSpinner, FaBookOpen } from 'react-icons/fa';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAnimation } from '../../../context/AnimationContext';
import { useAuth } from '../../../context/AuthContext';
import { booksApi } from '../../books/api';
import styles from './DiscoverySection.module.css';

// Map icon type to component
const ICONS = {
    author: FaPen,
    category: FaBook,
    search: FaSearch,
};

/**
 * A section displaying book recommendations with title and subtitle
 */
const DiscoverySection = ({
    title,
    subtitle,
    iconType = 'author',
    books = [],
    emptyMessage = 'Keine Empfehlungen verfügbar'
}) => {
    const Icon = ICONS[iconType] || FaBook;

    if (!books || books.length === 0) {
        return (
            <div className={styles.discoverySection}>
                <div className={styles.sectionHeader}>
                    <Icon className={styles.headerIcon} />
                    <h3 className={styles.sectionTitle}>{title}</h3>
                    {subtitle && <span className={styles.sectionSubtitle}>• {subtitle}</span>}
                </div>
                <div className={styles.emptyState}>
                    <FaBookOpen className={styles.emptyIcon} />
                    <p>{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.discoverySection}>
            <div className={styles.sectionHeader}>
                <Icon className={styles.headerIcon} />
                <h3 className={styles.sectionTitle}>{title}</h3>
                {subtitle && <span className={styles.sectionSubtitle}>• {subtitle}</span>}
            </div>
            <div className={styles.booksGrid}>
                {books.map((book, index) => (
                    <DiscoveryBookCard key={book.isbn || index} book={book} />
                ))}
            </div>
        </div>
    );
};

/**
 * Individual book card with add-to-library functionality
 */
const DiscoveryBookCard = ({ book }) => {
    const [isAdding, setIsAdding] = useState(false);
    const imageRef = useRef(null);
    const queryClient = useQueryClient();
    const toast = useToast();
    const { t } = useTranslation();
    const { token } = useAuth();
    const { flyBook } = useAnimation();

    // Fetch owned ISBNs to check duplicates
    const { data: ownedIsbns } = useQuery({
        queryKey: ['ownedIsbns'],
        queryFn: async () => {
            if (!token) return [];
            const response = await booksApi.getOwnedIsbns();
            return response || [];
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });

    const ownedIsbnsSet = new Set((ownedIsbns || []).map(isbn => isbn.replace(/-/g, '')));
    const cleanIsbn = book.isbn?.replace(/-/g, '');
    const isOwned = cleanIsbn && ownedIsbnsSet.has(cleanIsbn);

    const addBookMutation = useMutation({
        mutationFn: async () => {
            if (!token) throw new Error(t('search.toast.loginRequired'));
            if (!book.isbn) throw new Error(t('search.toast.noIsbn'));

            const newBook = {
                isbn: book.isbn,
                title: book.title || 'Unbekannter Titel',
                authorName: Array.isArray(book.authors) ? book.authors.join(', ') : (book.authors || 'Unbekannt'),
                publishDate: book.publishedDate || null,
                coverUrl: book.coverUrl || null,
                pageCount: book.pageCount || 0,
                categories: Array.isArray(book.categories) ? book.categories.join(', ') : (book.categories || null),
            };

            return await booksApi.create(newBook);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            queryClient.invalidateQueries({ queryKey: ['ownedIsbns'] });
            toast.close('add-book-toast');
            toast({
                id: 'add-book-toast',
                position: 'top',
                duration: 3000,
                containerStyle: { marginTop: '80px' },
                render: () => (
                    <div style={{
                        backgroundColor: '#38A169',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        textAlign: 'center'
                    }}>
                        {t('search.toast.successTitle')}
                    </div>
                ),
            });
        },
        onError: (error) => {
            toast({
                title: t('search.toast.errorTitle'),
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const handleAddClick = async (e) => {
        e.stopPropagation();
        if (isAdding || isOwned) return;

        // Start animation
        if (imageRef.current) {
            flyBook(imageRef.current.getBoundingClientRect(), book.coverUrl);
        }

        setIsAdding(true);
        try {
            await addBookMutation.mutateAsync();
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div
            className={`${styles.bookCard} ${isOwned ? styles.owned : ''}`}
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
                <img
                    ref={imageRef}
                    src={book.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                    alt={book.title}
                    className={styles.bookCover}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x225?text=No+Cover';
                    }}
                />
                {!isOwned && (
                    <div className={styles.hoverOverlay}>
                        {isAdding ? (
                            <FaSpinner className={`${styles.plusIcon} ${styles.spinning}`} />
                        ) : (
                            <FaPlus className={styles.plusIcon} />
                        )}
                    </div>
                )}
                {isOwned && (
                    <div className={styles.ownedBadge}>
                        ✓
                    </div>
                )}
            </div>
            <p className={styles.bookTitle} title={book.title}>
                {book.title}
            </p>
            <p className={styles.bookAuthor}>
                {Array.isArray(book.authors) ? book.authors[0] : book.authors || 'Unbekannter Autor'}
            </p>
        </div>
    );
};

export default DiscoverySection;
