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
    useDisclosure
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import { useReadingSessionPageLogic } from '../hooks/useReadingSessionPageLogic';
import { usePinstripeBackground } from '../../../shared/hooks/usePinstripeBackground';
import { useThemeTokens } from '../../../shared/hooks/useThemeTokens';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';

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

    usePinstripeBackground();
    const { bgColor, cardBg, textColor, subTextColor, brandColor } = useThemeTokens();

    if (fetchingBook || sessionLoading) {
        return (
            <Flex justify="center" align="center" h="100vh" bg={bgColor}>
                <Spinner size="xl" color={brandColor} thickness="4px" />
            </Flex>
        );
    }

    if (!book) return <Box textAlign="center" py={20} color={textColor}>{t('bookStats.notFound')}</Box>;

    return (
        <Box bg={bgColor} minH="100vh" py={8} px={{ base: 4, md: 8 }}>
            <Container maxW="container.xl">
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
                    <GridItem>
                        <SessionBookSidebar
                            book={book}
                            cardBg={cardBg}
                            textColor={textColor}
                            subTextColor={subTextColor}
                        />
                    </GridItem>

                    <GridItem w="full">
                        <VStack spacing={6} align="stretch">
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

                            <SessionNotesCard
                                note={note}
                                setNote={setNote}
                                cardBg={cardBg}
                            />
                        </VStack>
                    </GridItem>
                </Grid>

                <ConfirmDialog
                    isOpen={isExitConfirmOpen}
                    onClose={onExitConfirmClose}
                    onConfirm={confirmExit}
                    title={t('readingSession.alerts.exitConfirmTitle', 'End Session?')}
                    body={t('readingSession.alerts.exitConfirm')}
                    confirmLabel={t('common.leave')}
                    cancelLabel={t('common.cancel')}
                />
            </Container>
        </Box>
    );
};

export default ReadingSessionPage;
