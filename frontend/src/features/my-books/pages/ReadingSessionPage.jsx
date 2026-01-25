import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Spinner,
    Flex,
    Icon,
    Input,
    FormControl,
    FormLabel,
    Alert,
    AlertIcon,
    Grid,
    GridItem,
    Card,
    Textarea,
    Image,
    Progress
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaStop, FaArrowLeft, FaCheck, FaStickyNote, FaBookOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useReadingSession } from '../hooks/useReadingSession';
import { booksApi } from '../../books/api';
import { getHighResImage } from '../../../utils/googleBooks';

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

const ReadingSessionPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    // const toast = useToast();

    // State
    const [book, setBook] = useState(null);
    const [fetchingBook, setFetchingBook] = useState(true);
    const [imgSrc, setImgSrc] = useState('');
    const [note, setNote] = useState('');

    const {
        activeSession,
        startSession,
        stopSession,
        formattedTime,
        loading: sessionLoading,
        isPaused,
        pauseSession,
        resumeSession,
        isController,
        takeControl
    } = useReadingSession();

    // Check for session mismatch
    useEffect(() => {
        if (activeSession && book && activeSession.bookId !== book.id) {
            alert(t('readingSession.alerts.mismatch'));
            navigate('/my-books');
        }
    }, [activeSession, book, navigate, t]);

    // Local state for UI flow
    const [showStopConfirm, setShowStopConfirm] = useState(false);
    const [endPage, setEndPage] = useState('');
    const [hasStopped, setHasStopped] = useState(false);
    const [wasActive, setWasActive] = useState(false);

    // Apply brown background style (same as HomePage and BookStatsPage)
    useEffect(() => {
        const originalBgColor = document.body.style.backgroundColor;
        const originalBgImage = document.body.style.backgroundImage;

        document.body.style.backgroundColor = 'var(--accent-800)';
        document.body.style.backgroundImage = `repeating-linear-gradient(
            to right,
            transparent,
            transparent 39px,
            rgba(0, 0, 0, 0.1) 40px,
            rgba(0, 0, 0, 0.1) 41px
        )`;

        return () => {
            document.body.style.backgroundColor = originalBgColor || 'var(--bg-app)';
            document.body.style.backgroundImage = originalBgImage || 'none';
        };
    }, []);

    const bgColor = 'transparent';
    const cardBg = 'whiteAlpha.200'; // Glass effect
    const textColor = 'white';
    const subTextColor = 'gray.300';
    const brandColor = 'teal.200';

    // Helper to determine safe URL (copied from BookStatsPage)
    const getCoverInfo = (bookInfo) => {
        if (!bookInfo) return { safeUrl: '', fallbackUrl: '', preferOpenLibrary: false, googleUrl: '' };

        let fallbackUrl = '';
        let isbn = bookInfo.isbn;
        if (!isbn && bookInfo.industryIdentifiers) {
            const identifier = bookInfo.industryIdentifiers.find(id => id.type === 'ISBN_13') ||
                bookInfo.industryIdentifiers.find(id => id.type === 'ISBN_10');
            if (identifier) {
                isbn = identifier.identifier;
            }
        }

        if (isbn) {
            const cleanIsbn = isbn.replace(/-/g, '');
            if (cleanIsbn.length >= 10) {
                fallbackUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
            }
        }

        const preferOpenLibrary = (bookInfo.readingModes?.image === false) && fallbackUrl;
        const googleUrl = bookInfo.coverUrl ? getHighResImage(bookInfo.coverUrl) : '';

        const safeUrl = preferOpenLibrary
            ? fallbackUrl
            : (googleUrl || fallbackUrl);

        return { safeUrl, fallbackUrl, preferOpenLibrary, googleUrl };
    };

    // Fetch book details
    useEffect(() => {
        if (!token) return;
        const fetchBook = async () => {
            try {
                const data = await booksApi.getById(id);
                if (data) {
                    setBook(data);
                    // Default end page to current page
                    if (data.currentPage) setEndPage(data.currentPage);

                    const { safeUrl } = getCoverInfo(data);
                    setImgSrc(safeUrl);
                }
            } catch (error) {
                console.error("Failed to fetch book", error);
            } finally {
                setFetchingBook(false);
            }
        };
        fetchBook();
    }, [id, token]);

    const handleImageError = () => {
        if (!book) return;
        const { fallbackUrl, preferOpenLibrary, googleUrl } = getCoverInfo(book);

        if (imgSrc === fallbackUrl) {
            if (googleUrl && preferOpenLibrary) {
                setImgSrc(prev => prev === fallbackUrl ? googleUrl : prev);
            }
        } else {
            if (fallbackUrl && imgSrc !== fallbackUrl) {
                setImgSrc(fallbackUrl);
            }
        }
    };

    // Track active session history
    useEffect(() => {
        if (activeSession) {
            setWasActive(true);
        } else if (wasActive && !activeSession && !hasStopped) {
            alert(t('readingSession.alerts.endedRemote'));
            navigate('/my-books');
        }
    }, [activeSession, wasActive, hasStopped, navigate, t]);

    const isStartingRef = useRef(false);

    // Auto-start session if not active
    useEffect(() => {
        if (!sessionLoading && !activeSession && book && !hasStopped && !wasActive) {
            if (isStartingRef.current) return;
            isStartingRef.current = true;

            startSession(id).finally(() => {
                isStartingRef.current = false;
            });
        }
    }, [sessionLoading, activeSession, book, id, startSession, hasStopped, wasActive]);

    // Navigation Guard (Browser Back & Unload)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (activeSession) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        const handlePopState = (e) => {
            if (activeSession) {
                e.preventDefault();
                window.history.pushState(null, '', window.location.href);
                alert(t('readingSession.alerts.exitWarning'));
            }
        };

        if (activeSession) {
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('beforeunload', handleBeforeUnload);
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [activeSession, t]);

    const handleBackClick = () => {
        if (activeSession) {
            if (window.confirm(t('readingSession.alerts.exitConfirm'))) {
                // If user really wants to leave without stopping properly
                navigate('/my-books');
            }
        } else {
            navigate('/my-books');
        }
    };

    const handleConfirmStop = async () => {
        const pageNum = parseInt(endPage, 10);
        if (isNaN(pageNum)) return;

        const startPage = book.currentPage || 0;
        const pagesRead = pageNum - startPage;

        setHasStopped(true);
        const success = await stopSession(new Date(), pageNum);
        if (success) {
            alert(t('readingSession.alerts.summary', { pages: pagesRead > 0 ? pagesRead : 0 }));
            navigate('/my-books');
        }
    };

    const handleStopClick = () => {
        if (!isPaused) {
            pauseSession();
        }
        setShowStopConfirm(true);
    };

    const handleStopCancel = () => {
        setShowStopConfirm(false);
        resumeSession();
    };

    if (fetchingBook || sessionLoading) {
        return (
            <Flex justify="center" align="center" h="100vh" bg={bgColor}>
                <Spinner size="xl" color={brandColor} thickness="4px" />
            </Flex>
        );
    }

    if (!book) return <Box textAlign="center" py={20} color={textColor}>Book not found</Box>;

    return (
        <Box bg={bgColor} minH="100vh" py={8} px={{ base: 4, md: 8 }}>
            <Container maxW="container.xl">
                {/* Header */}
                <Button
                    leftIcon={<Icon as={FaArrowLeft} />}
                    mb={8}
                    variant="ghost"
                    color={subTextColor}
                    _hover={{ color: brandColor, bg: 'whiteAlpha.100' }}
                    onClick={handleBackClick}
                    pl={0}
                >
                    {t('myBooks.title')}
                </Button>

                <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8} alignItems="start">

                    {/* Left: Book Info */}
                    <GridItem>
                        <MotionBox
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card bg={cardBg} borderRadius="2xl" boxShadow="lg" p={6} backdropFilter="blur(10px)">
                                <VStack spacing={6} align="center" w="full">
                                    <Box
                                        borderRadius="xl"
                                        overflow="hidden"
                                        boxShadow="2xl"
                                        maxW="200px"
                                        w="100%"
                                        bg="gray.200"
                                        ratio={2 / 3}
                                    >
                                        <Image
                                            src={imgSrc || 'https://via.placeholder.com/200x300?text=No+Cover'}
                                            onError={handleImageError}
                                            alt={book.title}
                                            w="100%"
                                            h="auto"
                                            objectFit="cover"
                                            fallbackSrc="https://via.placeholder.com/200x300?text=No+Cover"
                                        />
                                    </Box>

                                    <Box textAlign="center" w="full">
                                        <Heading size="md" mb={1} color={textColor} fontWeight="800" lineHeight="1.2">
                                            {book.title}
                                        </Heading>
                                        <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                                            {book.authorName}
                                        </Text>
                                    </Box>

                                    <Box w="full" h="1px" bg="whiteAlpha.200" />

                                    <Box w="full">
                                        <Flex justify="space-between" mb={2} fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                                            <Text>{t('bookStats.currentPage')}</Text>
                                            <Text>{book.currentPage || 0}</Text>
                                        </Flex>
                                        <Progress
                                            value={book.pageCount ? ((book.currentPage || 0) / book.pageCount) * 100 : 0}
                                            size="sm"
                                            colorScheme="teal"
                                            borderRadius="full"
                                            bg="whiteAlpha.100"
                                        />
                                    </Box>
                                </VStack>
                            </Card>
                        </MotionBox>
                    </GridItem>

                    {/* Right: Controls & Notes */}
                    <GridItem w="full">
                        <VStack spacing={6} align="stretch">
                            {/* Timer & Controls Card */}
                            <MotionCard
                                bg={cardBg}
                                borderRadius="2xl"
                                boxShadow="xl"
                                p={8}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                backdropFilter="blur(10px)"
                            >
                                <VStack spacing={8} textAlign="center">
                                    <Flex align="center" color={brandColor}>
                                        <Icon as={FaBookOpen} mr={2} />
                                        <Text fontWeight="bold" letterSpacing="wider" textTransform="uppercase" fontSize="sm">{t('readingSession.activeSession')}</Text>
                                    </Flex>

                                    <Box>
                                        <Text
                                            fontSize={{ base: "6xl", md: "8xl" }}
                                            fontWeight="bold"
                                            fontFamily="monospace"
                                            color={isPaused ? "gray.500" : "white"}
                                            textShadow="0 0 20px rgba(129, 230, 217, 0.3)" // Glow effect
                                            lineHeight="1"
                                        >
                                            {formattedTime}
                                        </Text>
                                        <Text color={isPaused ? "orange.300" : "teal.300"} mt={2} fontWeight="medium" letterSpacing="wide">
                                            {isPaused ? t('readingSession.paused') : t('readingSession.readingPrompt')}
                                        </Text>
                                    </Box>

                                    {!isController && (
                                        <Alert status="warning" borderRadius="md" variant="solid" bg="orange.500">
                                            <AlertIcon />
                                            <Box flex="1">
                                                <Text fontWeight="bold">{t('readingSession.remote.title')}</Text>
                                                <Text fontSize="sm">{t('readingSession.remote.desc')}</Text>
                                            </Box>
                                            <Button colorScheme="whiteAlpha" size="sm" onClick={takeControl}>
                                                {t('readingSession.remote.takeControl')}
                                            </Button>
                                        </Alert>
                                    )}

                                    {showStopConfirm ? (
                                        <MotionBox
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            w="full"
                                            maxW="md"
                                            bg="whiteAlpha.100"
                                            p={6}
                                            borderRadius="xl"
                                        >
                                            <VStack spacing={4}>
                                                <Text color="white" fontWeight="bold" fontSize="lg">{t('readingSession.finish.title')}</Text>
                                                <FormControl>
                                                    <FormLabel color={subTextColor}>{t('readingSession.finish.endPage')}</FormLabel>
                                                    <Input
                                                        type="number"
                                                        value={endPage}
                                                        onChange={(e) => setEndPage(e.target.value)}
                                                        placeholder={book.currentPage}
                                                        bg="whiteAlpha.100"
                                                        border="none"
                                                        color="white"
                                                        _focus={{ bg: "whiteAlpha.200", boxShadow: "none" }}
                                                    />
                                                </FormControl>
                                                <HStack spacing={4} w="full">
                                                    <Button flex={1} colorScheme="teal" onClick={handleConfirmStop} leftIcon={<FaCheck />}>
                                                        {t('readingSession.controls.save')}
                                                    </Button>
                                                    <Button flex={1} variant="ghost" colorScheme="whiteAlpha" onClick={handleStopCancel} color="white">
                                                        {t('readingSession.controls.cancel')}
                                                    </Button>
                                                </HStack>
                                            </VStack>
                                        </MotionBox>
                                    ) : (
                                        <HStack spacing={6} pt={4}>
                                            {isPaused ? (
                                                <Button
                                                    size="lg"
                                                    colorScheme="teal"
                                                    borderRadius="full"
                                                    w="160px"
                                                    h="64px"
                                                    leftIcon={<FaPlay />}
                                                    onClick={resumeSession}
                                                    isDisabled={!isController}
                                                    fontSize="xl"
                                                    _hover={{ transform: 'scale(1.05)' }}
                                                    transition="all 0.2s"
                                                    boxShadow="0 0 15px rgba(56, 178, 172, 0.5)"
                                                >
                                                    {t('readingSession.controls.resume')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="lg"
                                                    colorScheme="orange"
                                                    borderRadius="full"
                                                    w="160px"
                                                    h="64px"
                                                    leftIcon={<FaPause />}
                                                    onClick={pauseSession}
                                                    isDisabled={!isController}
                                                    fontSize="xl"
                                                    _hover={{ transform: 'scale(1.05)' }}
                                                    transition="all 0.2s"
                                                >
                                                    {t('readingSession.controls.pause')}
                                                </Button>
                                            )}

                                            <Button
                                                size="lg"
                                                variant="outline"
                                                borderRadius="full"
                                                w="160px"
                                                h="64px"
                                                leftIcon={<FaStop />}
                                                onClick={handleStopClick}
                                                isDisabled={!isController}
                                                color="red.300"
                                                borderColor="red.300"
                                                _hover={{ bg: 'red.900', borderColor: 'red.400' }}
                                                fontSize="xl"
                                            >
                                                {t('readingSession.controls.stop')}
                                            </Button>
                                        </HStack>
                                    )}
                                </VStack>
                            </MotionCard>

                            {/* Notes Card */}
                            <MotionCard
                                bg={cardBg}
                                borderRadius="2xl"
                                boxShadow="lg"
                                p={6}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                backdropFilter="blur(10px)"
                            >
                                <Flex align="center" mb={4} color="yellow.200">
                                    <Icon as={FaStickyNote} mr={2} />
                                    <Text fontWeight="bold" textTransform="uppercase" fontSize="sm" letterSpacing="wider">{t('readingSession.notes.title')}</Text>
                                </Flex>
                                <Textarea
                                    placeholder={t('readingSession.notes.placeholder')}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    bg="whiteAlpha.100"
                                    border="none"
                                    color="white"
                                    _placeholder={{ color: "gray.500" }}
                                    _focus={{ bg: "whiteAlpha.200", boxShadow: "none" }}
                                    resize="none"
                                    rows={5}
                                />
                                <Flex justify="flex-end" mt={2}>
                                    <Text fontSize="xs" color="gray.500">{t('readingSession.notes.helper')}</Text>
                                </Flex>
                            </MotionCard>
                        </VStack>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    );
};

export default ReadingSessionPage;
