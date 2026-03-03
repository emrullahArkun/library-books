import { useEffect, useState, useRef } from 'react';
import { FaTrash, FaTrashAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useMyBooks } from './hooks/useMyBooks';
import { usePinstripeBackground } from '../../shared/hooks/usePinstripeBackground';
import ConfirmDialog from '../../shared/components/ConfirmDialog';

import MyBookCard from './components/MyBookCard';
import {
    Flex,
    Button,
    Center,
    Text,
    HStack,
    Box,
    IconButton,
    useToast,
    useDisclosure,
} from '@chakra-ui/react';

function MyBooks() {
    const { t } = useTranslation();
    const containerRef = useRef(null);

    const [dynamicPageSize, setDynamicPageSize] = useState(12);

    const {
        books,
        loading,
        error,
        selectedBooks,
        toggleSelection,
        deleteBook,
        deleteSelected,
        deleteAll,
        updateBookProgress,
        page,
        setPage,
        totalPages,
        deleteError
    } = useMyBooks(dynamicPageSize);

    const toast = useToast();

    // Dialog States
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isDeleteAllOpen, onOpen: onDeleteAllOpen, onClose: onDeleteAllClose } = useDisclosure();
    const { isOpen: isDeleteSelectedOpen, onOpen: onDeleteSelectedOpen, onClose: onDeleteSelectedClose } = useDisclosure();

    const [bookToDelete, setBookToDelete] = useState(null);

    useEffect(() => {
        if (deleteError) {
            toast({
                title: t('myBooks.error', { message: deleteError.message }),
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        }
    }, [deleteError, toast, t]);

    const confirmDelete = () => {
        if (bookToDelete) {
            deleteBook(bookToDelete);
            setBookToDelete(null);
            onDeleteClose();
        }
    };

    const confirmDeleteSelected = () => {
        deleteSelected();
        onDeleteSelectedClose();
    };

    const confirmDeleteAll = () => {
        deleteAll();
        onDeleteAllClose();
    };

    usePinstripeBackground();

    // Dynamic Page Size Calculation
    useEffect(() => {
        const calculatePageSize = () => {
            const width = window.innerWidth;
            const padding = width >= 768 ? 64 : 32;
            const scrollbarBuffer = 20;
            const availableWidth = width - padding - scrollbarBuffer;
            const cardWidth = 240;
            const gap = 32;
            const itemWidth = cardWidth + gap;

            let columns = Math.floor((availableWidth + gap) / itemWidth);
            if (width < 480) {
                columns = 1;
            } else if (columns < 1) {
                columns = 1;
            }

            const newPageSize = columns * 2;
            setDynamicPageSize(prev => prev !== newPageSize ? newPageSize : prev);
        };

        calculatePageSize();

        let timeoutId;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(calculatePageSize, 150);
        };

        window.addEventListener('resize', debouncedResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedResize);
        };
    }, []);

    if (loading && page === 0 && books.length === 0) return <Center h="200px" color="white">{t('myBooks.loading')}</Center>;
    if (error) return <Center h="200px" color="red.300">{t('myBooks.error', { message: error })}</Center>;

    return (
        <Box w="100%" px={{ base: 4, md: 8 }} py={6} ref={containerRef} minH="calc(100vh - 80px)">
            <Flex justify="flex-end" align="center" mb={6} wrap="wrap" gap={4}>

                <HStack spacing={4}>
                    {selectedBooks.size > 0 && (
                        <Button
                            leftIcon={<FaTrash />}
                            onClick={onDeleteSelectedOpen}
                            bg="whiteAlpha.200"
                            color="white"
                            _hover={{ bg: 'whiteAlpha.300' }}
                            _active={{ bg: 'whiteAlpha.400' }}
                            backdropFilter="blur(5px)"
                        >
                            {t('myBooks.deleteSelectedCount', { count: selectedBooks.size })}
                        </Button>
                    )}
                    <Button
                        leftIcon={<FaTrashAlt />}
                        onClick={onDeleteAllOpen}
                        bg="whiteAlpha.200"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.300' }}
                        _active={{ bg: 'whiteAlpha.400' }}
                        backdropFilter="blur(5px)"
                    >
                        {t('myBooks.deleteAll')}
                    </Button>
                </HStack>
            </Flex>

            {books.length === 0 ? (
                <Center flexDirection="column" py={10} color="gray.300">
                    <Text fontSize="lg">{t('myBooks.empty.line1')}</Text>
                    <Text>{t('myBooks.empty.line2')}</Text>
                </Center>
            ) : (
                <>
                    <Flex wrap="wrap" gap={8} justify="flex-start" minH="800px" alignContent="flex-start">
                        {books.map(book => (
                            <Box key={book.id} w={{ base: "100%", sm: "240px" }} flexShrink={0}>
                                <MyBookCard
                                    book={book}
                                    isSelected={selectedBooks.has(book.id)}
                                    onToggleSelect={toggleSelection}
                                    onUpdateProgress={updateBookProgress}
                                />
                            </Box>
                        ))}
                    </Flex>

                    {totalPages > 1 && (
                        <Flex justify="center" align="center" mt={8} gap={4}>
                            <IconButton
                                icon={<FaChevronLeft />}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                isDisabled={page === 0}
                                colorScheme="whiteAlpha"
                                color="white"
                                variant="ghost"
                                fontSize="2xl"
                                aria-label="Previous Page"
                                _hover={{
                                    bg: 'whiteAlpha.200',
                                    transform: 'scale(1.1)'
                                }}
                            />

                            <IconButton
                                icon={<FaChevronRight />}
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                isDisabled={page >= totalPages - 1}
                                colorScheme="whiteAlpha"
                                color="white"
                                variant="ghost"
                                fontSize="2xl"
                                aria-label="Next Page"
                                _hover={{
                                    bg: 'whiteAlpha.200',
                                    transform: 'scale(1.1)'
                                }}
                            />
                        </Flex>
                    )}

                    <ConfirmDialog
                        isOpen={isDeleteOpen}
                        onClose={onDeleteClose}
                        onConfirm={confirmDelete}
                        title={t('myBooks.confirmDeleteTitle', 'Delete Book?')}
                        body={t('myBooks.confirmDelete')}
                        confirmLabel={t('common.delete')}
                        cancelLabel={t('common.cancel')}
                    />

                    <ConfirmDialog
                        isOpen={isDeleteSelectedOpen}
                        onClose={onDeleteSelectedClose}
                        onConfirm={confirmDeleteSelected}
                        title={t('myBooks.confirmDeleteSelectedTitle', 'Delete Selected Books?')}
                        body={t('myBooks.confirmDeleteSelected', { count: selectedBooks.size })}
                        confirmLabel={t('common.delete')}
                        cancelLabel={t('common.cancel')}
                    />

                    <ConfirmDialog
                        isOpen={isDeleteAllOpen}
                        onClose={onDeleteAllClose}
                        onConfirm={confirmDeleteAll}
                        title={t('myBooks.confirmDeleteAllTitle', 'Delete ALL Books?')}
                        body={t('myBooks.confirmDeleteAll')}
                        confirmLabel={t('common.deleteAll')}
                        cancelLabel={t('common.cancel')}
                    />
                </>
            )}
        </Box>
    );
}

export default MyBooks;
