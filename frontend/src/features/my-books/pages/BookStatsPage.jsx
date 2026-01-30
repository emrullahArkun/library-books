import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Grid,
    GridItem,
    SimpleGrid,
    Icon,
    useDisclosure,
    useToast,
    Spinner,
    Flex,
    VStack
} from '@chakra-ui/react';
import { booksApi } from '../../books/api';
import { useBookStats } from '../hooks/useBookStats';
import { useBookStatsCalculations } from '../hooks/useBookStatsCalculations';
import { FaBookOpen, FaChartLine, FaArrowLeft, FaClock } from 'react-icons/fa';

import StatsCard from '../components/StatsCard';
import BookGoalModal from '../components/BookGoalModal';
import BookStatsSidebar from '../components/BookStatsSidebar';
import BookStatsCharts from '../components/BookStatsCharts';

const BookStatsPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Custom Hook for Data
    const { book, sessions, loading, refetch } = useBookStats(id);

    // Custom Hook for Calculations
    const { stats, goalProgress } = useBookStatsCalculations(book, sessions);

    // Goal State
    const [goalType, setGoalType] = useState('WEEKLY');
    const [goalPages, setGoalPages] = useState('');
    const [isSavingGoal, setIsSavingGoal] = useState(false);

    useEffect(() => {
        if (book?.readingGoalType) setGoalType(book.readingGoalType);
        if (book?.readingGoalPages) setGoalPages(book.readingGoalPages);
    }, [book]);

    const handleSaveGoal = async () => {
        setIsSavingGoal(true);
        try {
            await booksApi.updateGoal(id, goalType, parseInt(goalPages, 10));
            toast({ title: t('bookStats.goal.modal.success', 'Goal updated!'), status: 'success', duration: 3000 });
            refetch();
            onClose();
        } catch (error) {
            toast({ title: t('bookStats.goal.modal.error', 'Failed to update goal'), status: 'error', duration: 3000 });
        } finally {
            setIsSavingGoal(false);
        }
    };

    // Apply brown background style (same as HomePage)
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

    // Force styling for dark brown background
    const bgColor = 'transparent';
    const cardBg = 'whiteAlpha.200'; // Glass effect
    const textColor = 'white';
    const subTextColor = 'gray.300';
    const brandColor = 'teal.200';

    if (loading) return (
        <Flex justify="center" align="center" h="100vh" bg={bgColor}>
            <Spinner size="xl" color={brandColor} thickness="4px" />
        </Flex>
    );

    if (!book) return <Box textAlign="center" py={20} color={textColor}>{t('bookStats.notFound')}</Box>;

    return (
        <Box bg={bgColor} minH="100vh" py={8} px={{ base: 4, md: 8 }} w="100%">
            <Box w="100%">

                {/* Header / Nav */}
                <Button
                    leftIcon={<Icon as={FaArrowLeft} />}
                    mb={8}
                    variant="ghost"
                    color={subTextColor}
                    _hover={{ color: brandColor, bg: 'whiteAlpha.100' }}
                    onClick={() => navigate('/my-books')}
                    pl={0}
                >
                    {t('myBooks.title')}
                </Button>

                <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8} alignItems="start" w="100%">
                    {/* Left Sidebar: Detailed Book Info */}
                    <GridItem position={{ lg: "sticky" }} top="20px">
                        <BookStatsSidebar
                            book={book}
                            stats={stats}
                            goalProgress={goalProgress}
                            onOpenModal={onOpen}
                            cardBg={cardBg}
                            textColor={textColor}
                            subTextColor={subTextColor}
                        />
                    </GridItem>

                    {/* Right Content: Dashboard */}
                    <GridItem w="full">
                        <VStack spacing={8} align="stretch" w="full">
                            {/* KPI Cards */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                <StatsCard
                                    icon={FaClock}
                                    label={t('bookStats.totalTime.label')}
                                    value={stats?.totalTime || '0h 0m'}
                                    subLabel={t('bookStats.totalTime.subLabel')}
                                    color="teal.200"
                                    delay={0.1}
                                    bg={cardBg}
                                    textColor={textColor}
                                />
                                <StatsCard
                                    icon={FaBookOpen}
                                    label={t('bookStats.speed.label')}
                                    value={stats?.speed || '0.0'}
                                    subLabel={t('bookStats.speed.subLabel')}
                                    color="blue.200"
                                    delay={0.2}
                                    bg={cardBg}
                                    textColor={textColor}
                                />
                                {!book.completed && (
                                    <StatsCard
                                        icon={FaChartLine}
                                        label={t('bookStats.projection.label')}
                                        value={`~${stats?.timeLeft || '...'}`}
                                        subLabel={t('bookStats.projection.subLabel')}
                                        color="purple.200"
                                        delay={0.3}
                                        bg={cardBg}
                                        textColor={textColor}
                                    />
                                )}
                            </SimpleGrid>

                            {/* Main Chart */}
                            {stats && (
                                <BookStatsCharts
                                    stats={stats}
                                    sessions={sessions}
                                    bookId={id}
                                    cardBg={cardBg}
                                    textColor={textColor}
                                    subTextColor={subTextColor}
                                />
                            )}
                        </VStack>
                    </GridItem>
                </Grid>
            </Box>

            {/* Set Goal Modal */}
            <BookGoalModal
                isOpen={isOpen}
                onClose={onClose}
                goalType={goalType}
                setGoalType={setGoalType}
                goalPages={goalPages}
                setGoalPages={setGoalPages}
                handleSaveGoal={handleSaveGoal}
                isSavingGoal={isSavingGoal}
            />
        </Box>
    );
};

export default BookStatsPage;
