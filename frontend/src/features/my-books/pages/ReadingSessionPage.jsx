import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    Flex
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import { useReadingSessionPageLogic } from '../hooks/useReadingSessionPageLogic';

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
            </Container>
        </Box>
    );
};

export default ReadingSessionPage;
