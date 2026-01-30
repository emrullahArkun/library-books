import { useEffect, useState, useRef } from 'react';
import { FaTrash, FaTrashAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useMyBooks } from './hooks/useMyBooks';
import { usePinstripeBackground } from '../../hooks/usePinstripeBackground';

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
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';

function MyBooks() {
    const { t } = useTranslation();
    const containerRef = useRef(null);

    // Initial page size (will be updated by responsive logic)
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
    const cancelRef = useRef();

    // Dialog States
    const { isOpen: isDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isDeleteAllOpen, onOpen: onDeleteAllOpen, onClose: onDeleteAllClose } = useDisclosure();
    const { isOpen: isDeleteSelectedOpen, onOpen: onDeleteSelectedOpen, onClose: onDeleteSelectedClose } = useDisclosure();

    const [bookToDelete, setBookToDelete] = useState(null);

    // Effect for errors from hook
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

            // Padding based on Chakra breakpoints (approximate)
            // base: px=4 (16px * 2 = 32px)
            // md: px=8 (32px * 2 = 64px)
            const padding = width >= 768 ? 64 : 32;
            const scrollbarBuffer = 20;

            const availableWidth = width - padding - scrollbarBuffer;

            const cardWidth = 240; // Card fixed width on sm+
            const gap = 32; // Gap between cards (chakra spacing=8)
            const itemWidth = cardWidth + gap;

            // How many columns fit?
            // Formula: N * cardWidth + (N-1) * gap <= availableWidth
            // N * (cardWidth + gap) - gap <= availableWidth
            // N * itemWidth <= availableWidth + gap
            let columns = Math.floor((availableWidth + gap) / itemWidth);

            // On mobile (base), cards are 100% width, so effectively 1 column
            if (width < 480) { // sm is 30em ~ 480px
                columns = 1;
            } else if (columns < 1) {
                columns = 1;
            }

            // We want exactly 2 rows
            const newPageSize = columns * 2;

            // console.log(`[MyBooks] Width: ${width}, Available: ${availableWidth}, Cols: ${columns}, NewSize: ${newPageSize}`);

            setDynamicPageSize(prev => {
                if (prev !== newPageSize) {
                    return newPageSize;
                }
                return prev;
            });
        };

        // Initial calc
        calculatePageSize();

        // Listener
        window.addEventListener('resize', calculatePageSize);
        return () => window.removeEventListener('resize', calculatePageSize);
    }, []);

    if (loading && page === 0 && books.length === 0) return <Center h="200px" color="white">{t('myBooks.loading')}</Center>;
    if (error) return <Center h="200px" color="red.300">{t('myBooks.error', { message: error })}</Center>;

    return (
        <Box w="100%" px={{ base: 4, md: 8 }} py={6} ref={containerRef}>
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
                            {t('myBooks.deleteSelectedCount', { count: selectedBooks.size, defaultValue: `Löschen (${selectedBooks.size})` })}
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

                    {/* Simplified Arrow Pagination */}
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

                    {/* CONFIRMATION DIALOGS */}

                    {/* Delete Single Book */}
                    <AlertDialog
                        isOpen={isDeleteOpen}
                        leastDestructiveRef={cancelRef}
                        onClose={onDeleteClose}
                        isCentered
                    >
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                    {t('myBooks.confirmDeleteTitle', 'Delete Book?')}
                                </AlertDialogHeader>

                                <AlertDialogBody>
                                    {t('myBooks.confirmDelete', 'Are you sure you want to delete this book?')}
                                </AlertDialogBody>

                                <AlertDialogFooter>
                                    <Button ref={cancelRef} onClick={onDeleteClose}>
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                    <Button colorScheme='red' onClick={confirmDelete} ml={3}>
                                        {t('common.delete', 'Delete')}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>

                    {/* Delete Selected */}
                    <AlertDialog
                        isOpen={isDeleteSelectedOpen}
                        leastDestructiveRef={cancelRef}
                        onClose={onDeleteSelectedClose}
                        isCentered
                    >
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                    {t('myBooks.confirmDeleteSelectedTitle', 'Delete Selected Books?')}
                                </AlertDialogHeader>

                                <AlertDialogBody>
                                    {t('myBooks.confirmDeleteSelected', { count: selectedBooks.size })}
                                </AlertDialogBody>

                                <AlertDialogFooter>
                                    <Button ref={cancelRef} onClick={onDeleteSelectedClose}>
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                    <Button colorScheme='red' onClick={confirmDeleteSelected} ml={3}>
                                        {t('common.delete', 'Delete')}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>

                    {/* Delete All */}
                    <AlertDialog
                        isOpen={isDeleteAllOpen}
                        leastDestructiveRef={cancelRef}
                        onClose={onDeleteAllClose}
                        isCentered
                    >
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                    {t('myBooks.confirmDeleteAllTitle', 'Delete ALL Books?')}
                                </AlertDialogHeader>

                                <AlertDialogBody>
                                    {t('myBooks.confirmDeleteAll', 'Are you sure you want to delete ALL books? This cannot be undone.')}
                                </AlertDialogBody>

                                <AlertDialogFooter>
                                    <Button ref={cancelRef} onClick={onDeleteAllClose}>
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                    <Button colorScheme='red' onClick={confirmDeleteAll} ml={3}>
                                        {t('common.delete', 'Delete All')}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                </>
            )}
        </Box>
    );
}

export default MyBooks;
