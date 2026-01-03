import React, { useState, useEffect } from 'react';
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
    useColorModeValue,
    Spinner,
    Flex,
    Icon,
    Input,
    FormControl,
    FormLabel,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaStop, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useReadingSession } from '../hooks/useReadingSession';
import { api } from '../../../api/api';

const ReadingSessionPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [book, setBook] = useState(null);
    const [fetchingBook, setFetchingBook] = useState(true);

    const {
        activeSession,
        startSession,
        stopSession,
        formattedTime,
        excludeTimeFromSession,
        loading: sessionLoading,
        isPaused,
        pausedAt,
        frozenTime,
        pauseSession,
        resumeSession
    } = useReadingSession();

    // Local state for UI flow
    const [showStopConfirm, setShowStopConfirm] = useState(false);
    const [endPage, setEndPage] = useState('');
    const [hasStopped, setHasStopped] = useState(false);

    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    // Fetch book details
    useEffect(() => {
        if (!token) return;
        const fetchBook = async () => {
            try {
                const res = await api.books.getById(id);
                if (res.ok) {
                    const data = await res.json();
                    setBook(data);
                    // Default end page to current page
                    if (data.currentPage) setEndPage(data.currentPage);
                }
            } catch (error) {
                console.error("Failed to fetch book", error);
            } finally {
                setFetchingBook(false);
            }
        };
        fetchBook();
    }, [id, token]);

    // Auto-start session if not active
    useEffect(() => {
        if (!sessionLoading && !activeSession && book && !hasStopped) {
            // Only auto-start if we are sure there is no session and we haven't just stopped one
            startSession(id);
        }
    }, [sessionLoading, activeSession, book, id, startSession, hasStopped]);

    // Handlers using Hook Methods
    const handlePause = () => {
        pauseSession();
    };

    const handleResume = () => {
        resumeSession();
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

    // Navigation Guard
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
                // Push current state back to prevent leaving
                window.history.pushState(null, '', window.location.href);
                alert(t('readingSession.exitWarning', 'Beende erst die Session bevor du verlässt!'));
            }
        };

        if (activeSession) {
            // Push initial state to ensure we have history to pop
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
            if (window.confirm(t('readingSession.exitConfirm', 'Beende erst die Session bevor du verlässt. Wirklich verlassen?'))) {
                alert(t('readingSession.exitWarning', 'Beende erst die Session bevor du verlässt!'));
                return;
            }
        } else {
            navigate('/my-books');
        }
    };

    const handleConfirmStop = async () => {
        const pageNum = parseInt(endPage, 10);
        if (isNaN(pageNum)) return;

        // Calculate pages read
        const startPage = book.currentPage || 0;
        const pagesRead = pageNum - startPage;

        setHasStopped(true); // Prevent auto-restart
        const success = await stopSession(new Date(), pageNum);
        if (success) {
            alert(t('readingSession.sessionSummary', { pages: pagesRead > 0 ? pagesRead : 0, defaultValue: `Du hast ${pagesRead > 0 ? pagesRead : 0} Seiten gelesen!` }));
            navigate('/my-books');
        }
    };

    if (fetchingBook || sessionLoading) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (!book) return <Box p={10}>Result not found</Box>;

    return (
        <Box bg={bgColor} minH="100vh" py={8}>
            <Container maxW="container.md">
                <Button
                    leftIcon={<Icon as={FaArrowLeft} />}
                    mb={6}
                    variant="ghost"
                    onClick={handleBackClick}
                >
                    {t('myBooks.title')}
                </Button>

                <VStack spacing={8} bg={cardBg} p={8} borderRadius="xl" boxShadow="xl" textAlign="center">
                    <Heading size="lg">{book.title}</Heading>
                    <Text color="gray.500">{t('readingSession.inSession', 'Aktuelle Lese-Sitzung')}</Text>

                    <Box
                        fontSize="6xl"
                        fontWeight="bold"
                        fontFamily="monospace"
                        color={isPaused ? "gray.400" : "teal.500"}
                    >
                        {frozenTime || formattedTime}
                    </Box>

                    {showStopConfirm ? (
                        <VStack spacing={4} w="100%" maxW="md">
                            <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                {t('readingSession.finishConfirm', 'Bist du fertig mit dem Lesen?')}
                            </Alert>

                            <FormControl>
                                <FormLabel>{t('readingSession.endPage', 'Auf welcher Seite bist du?')}</FormLabel>
                                <Input
                                    type="number"
                                    value={endPage}
                                    onChange={(e) => setEndPage(e.target.value)}
                                    placeholder={book.currentPage}
                                />
                            </FormControl>

                            <HStack spacing={4} w="100%">
                                <Button
                                    flex={1}
                                    colorScheme="red"
                                    onClick={handleConfirmStop}
                                    leftIcon={<FaCheck />}
                                    isDisabled={!endPage || isNaN(parseInt(endPage, 10))}
                                >
                                    {t('readingSession.confirmStop', 'Fertig')}
                                </Button>
                                <Button flex={1} variant="ghost" onClick={handleStopCancel}>
                                    {t('common.cancel', 'Doch weiterlesen')}
                                </Button>
                            </HStack>
                        </VStack>
                    ) : (
                        <HStack spacing={6} mt={4}>
                            {isPaused ? (
                                <Button
                                    size="lg"
                                    colorScheme="green"
                                    borderRadius="full"
                                    w="150px"
                                    h="60px"
                                    leftIcon={<FaPlay />}
                                    onClick={handleResume}
                                >
                                    {t('readingSession.resume', 'Weiter')}
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    colorScheme="yellow"
                                    borderRadius="full"
                                    w="150px"
                                    h="60px"
                                    leftIcon={<FaPause />}
                                    onClick={handlePause}
                                >
                                    {t('readingSession.pause', 'Pause')}
                                </Button>
                            )}

                            <Button
                                size="lg"
                                colorScheme="red"
                                variant="outline"
                                borderRadius="full"
                                w="150px"
                                h="60px"
                                leftIcon={<FaStop />}
                                onClick={handleStopClick}
                            >
                                {t('readingSession.stop', 'Stop')}
                            </Button>
                        </HStack>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default ReadingSessionPage;
