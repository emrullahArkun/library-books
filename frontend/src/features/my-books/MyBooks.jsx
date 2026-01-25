import { useEffect } from 'react';
import { FaTrash, FaTrashAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useMyBooks } from './hooks/useMyBooks';
import { useReadingSession } from './hooks/useReadingSession';
import MyBookCard from './components/MyBookCard';
import {
    Container,
    Flex,
    Button,
    SimpleGrid,
    Center,
    Text,
    HStack,
    Box
} from '@chakra-ui/react';

function MyBooks() {
    const { t } = useTranslation();
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
        updateBookStatus,
        page,
        setPage,
        totalPages
    } = useMyBooks();

    const {
        activeSession,
        startSession,
        stopSession,
        formattedTime,
        excludeTimeFromSession,

    } = useReadingSession();

    useEffect(() => {
        // Set body background to match Search Page (dark pinstripe)
        document.body.style.backgroundColor = 'var(--accent-800)';
        document.body.style.backgroundImage = `repeating-linear-gradient(
            to right,
            transparent,
            transparent 39px,
            rgba(0, 0, 0, 0.1) 40px,
            rgba(0, 0, 0, 0.1) 41px
        )`;

        // Reset when leaving
        return () => {
            document.body.style.backgroundColor = 'var(--bg-app)';
            document.body.style.backgroundImage = 'none';
        };
    }, []);

    if (loading) return <Center h="200px" color="white">{t('myBooks.loading')}</Center>;
    if (error) return <Center h="200px" color="red.300">{t('myBooks.error', { message: error })}</Center>;

    return (
        <Container maxW="container.xl" py={4}>
            <Flex justify="flex-end" align="center" mb={6} wrap="wrap" gap={4}>

                <HStack spacing={4}>
                    {selectedBooks.size > 0 && (
                        <Button
                            leftIcon={<FaTrash />}
                            onClick={deleteSelected}
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
                        onClick={deleteAll}
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
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
                        {books.map(book => (
                            <Box key={book.id} w="100%">
                                <MyBookCard
                                    book={book}
                                    isSelected={selectedBooks.has(book.id)}
                                    onToggleSelect={toggleSelection}
                                    onUpdateProgress={updateBookProgress}
                                    onUpdateStatus={updateBookStatus}
                                    activeSession={activeSession}
                                    onStartSession={startSession}
                                    onStopSession={stopSession}
                                    onExcludeTime={excludeTimeFromSession}
                                    timerTime={formattedTime}
                                    onDelete={deleteBook}
                                />
                            </Box>
                        ))}
                    </SimpleGrid>

                    {totalPages > 1 && (
                        <Flex justify="center" align="center" mt={8} gap={4}>
                            <Button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                isDisabled={page === 0}
                                leftIcon={<FaChevronLeft />}
                                colorScheme="whiteAlpha"
                                color="white"
                            >
                                {t('common.previous', 'Previous')}
                            </Button>
                            <Text color="white">
                                {t('common.pageOf', { current: page + 1, total: totalPages }, `Page ${page + 1} of ${totalPages}`)}
                            </Text>
                            <Button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                isDisabled={page >= totalPages - 1}
                                rightIcon={<FaChevronRight />}
                            >
                                {t('common.next', 'Next')}
                            </Button>
                        </Flex>
                    )}
                </>
            )}
        </Container>
    );
}

export default MyBooks;
