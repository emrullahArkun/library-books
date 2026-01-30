import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Button,
    Grid,
    GridItem,
    VStack,
    Icon,
    Spinner,
    Flex,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import { useReadingSessionPageLogic } from '../hooks/useReadingSessionPageLogic';
import { usePinstripeBackground } from '../../../hooks/usePinstripeBackground';

import SessionBookSidebar from '../components/SessionBookSidebar';
import SessionTimerCard from '../components/SessionTimerCard';
import SessionNotesCard from '../components/SessionNotesCard';

const ReadingSessionPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();

    const {
        book,
        fetchingBook,
        note,
        setNote,
        sessionLoading,
        formattedTime,
        isPaused,
        resumeSession,
        pauseSession,
        isController,
        takeControl,
        showStopConfirm,
        endPage,
        setEndPage,
        handleBackClick,
        handleStopClick,
        handleStopCancel,
        handleConfirmStop
    } = useReadingSessionPageLogic(id);

    const navigate = useNavigate();
    const { isOpen: isExitConfirmOpen, onOpen: onExitConfirmOpen, onClose: onExitConfirmClose } = useDisclosure();
    const cancelRef = useRef();

    const onBack = () => {
        const needsConfirm = handleBackClick();
        if (needsConfirm) {
            onExitConfirmOpen();
        }
    };

    const confirmExit = () => {
        onExitConfirmClose();
        navigate('/my-books');
    };

    // Apply brown background style (same as HomePage and BookStatsPage)
    // Apply brown background style (same as HomePage and BookStatsPage)
    usePinstripeBackground();

    const bgColor = 'transparent';
    const cardBg = 'whiteAlpha.200'; // Glass effect
    const textColor = 'white';
    const subTextColor = 'gray.300';
    const brandColor = 'teal.200';

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
                    onClick={onBack}
                    pl={0}
                >
                    {t('myBooks.title')}
                </Button>

                <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8} alignItems="start">

                    {/* Left: Book Info */}
                    <GridItem>
                        <SessionBookSidebar
                            book={book}
                            cardBg={cardBg}
                            textColor={textColor}
                            subTextColor={subTextColor}
                        />
                    </GridItem>

                    {/* Right: Controls & Notes */}
                    <GridItem w="full">
                        <VStack spacing={6} align="stretch">
                            {/* Timer & Controls Card */}
                            <SessionTimerCard
                                cardBg={cardBg}
                                brandColor={brandColor}
                                isPaused={isPaused}
                                formattedTime={formattedTime}
                                isController={isController}
                                takeControl={takeControl}
                                showStopConfirm={showStopConfirm}
                                endPage={endPage}
                                setEndPage={setEndPage}
                                currentPage={book.currentPage || '0'}
                                subTextColor={subTextColor}
                                handleConfirmStop={handleConfirmStop}
                                handleStopCancel={handleStopCancel}
                                resumeSession={resumeSession}
                                pauseSession={pauseSession}
                                handleStopClick={handleStopClick}
                            />

                            {/* Notes Card */}
                            <SessionNotesCard
                                note={note}
                                setNote={setNote}
                                cardBg={cardBg}
                            />
                        </VStack>
                    </GridItem>
                </Grid>

                {/* Exit Confirmation Dialog */}
                <AlertDialog
                    isOpen={isExitConfirmOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onExitConfirmClose}
                    isCentered
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                {t('readingSession.alerts.exitConfirmTitle', 'End Session?')}
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                {t('readingSession.alerts.exitConfirm', 'Are you sure you want to leave? The session is still running.')}
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onExitConfirmClose}>
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button colorScheme='red' onClick={confirmExit} ml={3}>
                                    {t('common.leave', 'Leave')}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </Container>
        </Box>
    );
};

export default ReadingSessionPage;
