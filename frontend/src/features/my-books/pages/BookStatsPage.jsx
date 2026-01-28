import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    Stat,
    StatNumber,
    StatHelpText,
    Image,
    Flex,
    Button,
    Card,
    CardBody,
    Spinner,
    Icon,
    Progress,
    VStack,
    Badge,
    Grid,
    GridItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    Stack,
    Input,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { booksApi } from '../../books/api';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { useBookStats } from '../hooks/useBookStats';
import { FaBookOpen, FaChartLine, FaCheck, FaArrowLeft, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getHighResImage } from '../../../utils/googleBooks';
import ReadingCalendar from '../components/ReadingCalendar';

// Motion components
const MotionCard = motion(Card);
const MotionBox = motion(Box);

const BookStatsPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Custom Hook
    const { book, sessions, loading, refetch } = useBookStats(id);

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

    const [imgSrc, setImgSrc] = useState('');

    // Helper to determine safe URL and metadata
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

    useEffect(() => {
        if (book) {
            const { safeUrl } = getCoverInfo(book);
            setImgSrc(safeUrl);
        }
    }, [book]);

    const handleImageError = () => {
        if (!book) return;
        const { fallbackUrl, preferOpenLibrary, googleUrl } = getCoverInfo(book);

        if (imgSrc === fallbackUrl) {
            // We tried OpenLibrary and it failed.
            if (googleUrl && preferOpenLibrary) {
                // We preferred OpenLibrary but it failed? Revert to Google.
                setImgSrc(prev => prev === fallbackUrl ? googleUrl : prev);
            }
        } else {
            // Google failed. Try OpenLibrary.
            if (fallbackUrl && imgSrc !== fallbackUrl) {
                setImgSrc(fallbackUrl);
            }
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
    const brandColor = 'teal.200'; // Lighter teal for dark bg

    // Calculations
    const stats = useMemo(() => {
        if (!sessions || !book) return null;

        const totalSeconds = sessions.reduce((acc, session) => {
            if (!session.endTime || !session.startTime) return acc;
            const start = new Date(session.startTime).getTime();
            const end = new Date(session.endTime).getTime();
            return acc + (end - start) / 1000;
        }, 0);

        const formatDuration = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return `${h}h ${m}m`;
        };

        const pagesReadTotal = book.currentPage || 0;
        const totalHoursRaw = totalSeconds / 3600;
        const speedRaw = totalHoursRaw > 0 ? pagesReadTotal / totalHoursRaw : 0;

        const pagesLeft = (book.pageCount || 0) - pagesReadTotal;
        let timeLeft = null;
        if (speedRaw > 0 && pagesLeft > 0) {
            const hoursLeftRaw = pagesLeft / speedRaw;
            const secondsLeft = hoursLeftRaw * 3600;
            timeLeft = formatDuration(secondsLeft);
        }

        // Sessions Grouping
        const sessionsByDay = sessions.reduce((acc, session) => {
            if (!session.endTime || session.endPage === null) return acc;
            const dateObj = new Date(session.endTime);
            const dateKey = dateObj.toLocaleDateString();
            if (!acc[dateKey] || new Date(acc[dateKey].endTime) < dateObj) {
                acc[dateKey] = session;
            }
            return acc;
        }, {});

        const graphData = Object.values(sessionsByDay)
            .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
            .map(s => ({
                date: new Date(s.endTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                fullDate: new Date(s.endTime).toLocaleDateString(),
                page: s.endPage
            }));

        const progressPercent = book.pageCount ? Math.min(100, Math.round((pagesReadTotal / book.pageCount) * 100)) : 0;

        return {
            totalTime: formatDuration(totalSeconds),
            speed: speedRaw.toFixed(1),
            timeLeft,
            graphData,
            progressPercent,
            pagesRead: pagesReadTotal,
            totalPages: book.pageCount
        };

    }, [sessions, book]);

    // Goal Progress Calculation
    const goalProgress = useMemo(() => {
        if (!book?.readingGoalType || !book?.readingGoalPages || !sessions) return null;

        let startDate = new Date();
        startOfTime(startDate, book.readingGoalType);

        function startOfTime(date, type) {
            date.setHours(0, 0, 0, 0);
            if (type === 'WEEKLY') {
                const day = date.getDay(); // 0=Sun
                // EU Week starts Monday (1). 
                // If Sunday (0), shift -6 days. If Mon (1), shift 0. If Tue (2), shift -1.
                // diff = day === 0 ? -6 : 1 - day;
                // date.setDate(date.getDate() + diff); -> THIS IS WRONG logic commonly.
                // Correct: Monday is 1. 
                const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                date.setDate(diff);
            } else {
                date.setDate(1); // 1st of month
            }
        }

        // Sort sessions to handle fallback calculation
        const sortedSessions = [...sessions].sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

        let currentPagesRead = 0;

        sortedSessions.forEach((session, index) => {
            const sessionEnd = new Date(session.endTime);
            if (sessionEnd < startDate) return;

            let added = 0;
            if (session.pagesRead != null) {
                added = session.pagesRead;
            } else {
                // Fallback
                const prevEndPage = index > 0 ? sortedSessions[index - 1].endPage : 0; // Assuming 0 if first session ever? Or session.book.startPage? 
                // Using 0 is risky if book started at page 100. But reasonable approximation for 'progress in app'.
                // Better: If index==0, we can't really know unless we checked book start, but '0' is safe default.
                added = (session.endPage || 0) - (prevEndPage || 0);
            }
            if (added > 0) currentPagesRead += added;
        });

        const isGoalReached = currentPagesRead >= book.readingGoalPages;
        const percent = Math.min(100, Math.round((currentPagesRead / book.readingGoalPages) * 100));

        // Multiplier calculation (e.g. 100/20 = 5x)
        let multiplier = 0;
        if (isGoalReached && book.readingGoalPages > 0) {
            multiplier = Math.floor(currentPagesRead / book.readingGoalPages);
        }

        return {
            current: currentPagesRead,
            target: book.readingGoalPages,
            type: book.readingGoalType,
            percent,
            isGoalReached,
            multiplier
        };
    }, [book, sessions]);


    if (loading) return (
        <Flex justify="center" align="center" h="100vh" bg={bgColor}>
            <Spinner size="xl" color={brandColor} thickness="4px" />
        </Flex>
    );

    if (!book) return <Box textAlign="center" py={20} color={textColor}>{t('bookStats.notFound')}</Box>;

    return (
        <Box bg={bgColor} minH="100vh" py={8} px={{ base: 4, md: 8 }}>
            <Container maxW="container.xl">

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

                <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8} alignItems="start">
                    {/* Left Sidebar: Detailed Book Info */}
                    <GridItem position={{ lg: "sticky" }} top="20px">
                        <MotionBox
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card bg={cardBg} borderRadius="2xl" boxShadow="lg" p={6} backdropFilter="blur(10px)">
                                <VStack spacing={6} align="center" w="full">
                                    {/* Cover Image */}
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

                                    {/* Title & Author */}
                                    <Box textAlign="center" w="full">
                                        <Heading size="lg" mb={1} color={textColor} fontWeight="800" lineHeight="1.2">
                                            {book.title}
                                        </Heading>
                                        <Text fontSize="md" color={subTextColor} fontWeight="medium">
                                            {book.authorName}
                                        </Text>
                                    </Box>

                                    <Box w="full" h="1px" bg="whiteAlpha.200" />

                                    {/* Goal Section */}
                                    <Box w="full" bg="whiteAlpha.100" p={4} borderRadius="xl">
                                        <Flex justify="space-between" align="center" mb={2}>
                                            <Text fontSize="sm" fontWeight="bold" color="gray.300">
                                                {t('bookStats.goal.title', 'Reading Goal')}
                                            </Text>
                                            <Button size="xs" colorScheme="teal" variant="ghost" onClick={onOpen}>
                                                {goalProgress ? t('bookStats.goal.edit', 'Edit') : t('bookStats.goal.set', 'Set Goal')}
                                            </Button>
                                        </Flex>

                                        {goalProgress ? (
                                            <VStack align="start" spacing={1} w="full">
                                                <Flex justify="space-between" w="full" fontSize="xs" color="teal.200" mb={1}>
                                                    <Text>{goalProgress.type === 'WEEKLY' ? 'Weekly' : 'Monthly'}</Text>
                                                    <Text>{goalProgress.current} / {goalProgress.target} pages</Text>
                                                </Flex>
                                                <Progress
                                                    value={goalProgress.percent}
                                                    size="sm"
                                                    colorScheme={goalProgress.isGoalReached ? "green" : "teal"}
                                                    w="full"
                                                    borderRadius="full"
                                                    hasStripe={goalProgress.isGoalReached}
                                                    isAnimated={goalProgress.isGoalReached}
                                                />
                                                {goalProgress.isGoalReached && (
                                                    <Flex align="center" mt={1} color="green.300">
                                                        <Icon as={FaCheck} mr={1} boxSize={3} />
                                                        <Text fontSize="xs" fontWeight="bold">
                                                            {goalProgress.type === 'WEEKLY' ? t('bookStats.goal.weeklyInfo', 'Weekly goal reached!') : t('bookStats.goal.monthlyInfo', 'Monthly goal reached!')}
                                                            {goalProgress.multiplier >= 2 && (
                                                                <Text as="span" ml={1} color="green.200" textTransform="uppercase" fontSize="xx-s">
                                                                    ({goalProgress.multiplier}x {t('bookStats.goal.surpassed', 'surpassed')}!)
                                                                </Text>
                                                            )}
                                                        </Text>
                                                    </Flex>
                                                )}
                                            </VStack>
                                        ) : (
                                            <Text fontSize="xs" color="gray.500">No active goal set.</Text>
                                        )}
                                    </Box>

                                    {/* Progress Section */}
                                    <Box w="full">
                                        <Flex justify="space-between" mb={2} fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                                            <Text>{t('bookStats.readProgress')}</Text>
                                            <Text>{stats.progressPercent}%</Text>
                                        </Flex>
                                        <Progress
                                            value={stats.progressPercent}
                                            size="sm"
                                            colorScheme="teal"
                                            borderRadius="full"
                                            bg="whiteAlpha.100"
                                        />
                                        <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
                                            {stats.pagesRead} <span style={{ opacity: 0.5 }}>/</span> {stats.totalPages} {t('bookStats.pages')}
                                        </Text>
                                    </Box>

                                    {book.completed && (
                                        <Badge
                                            colorScheme="teal"
                                            variant="solid"
                                            fontSize="sm"
                                            px={4}
                                            py={2}
                                            borderRadius="full"
                                            boxShadow="md"
                                        >
                                            <Icon as={FaCheck} mr={2} />
                                            {t('bookStats.completed')}
                                        </Badge>
                                    )}
                                </VStack>
                            </Card>
                        </MotionBox>
                    </GridItem>

                    {/* Right Content: Dashboard */}
                    <GridItem w="full">
                        <VStack spacing={8} align="stretch" w="full">
                            {/* KPI Cards */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                <StatsCard
                                    icon={FaClock}
                                    label={t('bookStats.totalTime.label')}
                                    value={stats.totalTime}
                                    subLabel={t('bookStats.totalTime.subLabel')}
                                    color="teal.200"
                                    delay={0.1}
                                    bg={cardBg}
                                    textColor={textColor}
                                />
                                <StatsCard
                                    icon={FaBookOpen}
                                    label={t('bookStats.speed.label')}
                                    value={stats.speed}
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
                                        value={`~${stats.timeLeft || '...'}`}
                                        subLabel={t('bookStats.projection.subLabel')}
                                        color="purple.200"
                                        delay={0.3}
                                        bg={cardBg}
                                        textColor={textColor}
                                    />
                                )}
                            </SimpleGrid>

                            {/* Main Chart */}
                            <MotionCard
                                bg={cardBg}
                                borderRadius="2xl"
                                boxShadow="xl"
                                p={8}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                backdropFilter="blur(10px)"
                            >
                                <Flex justify="space-between" align="center" mb={10}>
                                    <Box>
                                        <Heading size="md" fontWeight="bold" color={textColor} mb={1}>
                                            {t('bookStats.chart.title')}
                                        </Heading>
                                        <Text fontSize="sm" color={subTextColor}>{t('bookStats.chart.subTitle')}</Text>
                                    </Box>
                                    <Flex align="center">
                                        <ReadingCalendar sessions={sessions} />
                                    </Flex>
                                </Flex>

                                <Box h="400px" w="full">
                                    {stats.graphData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorPage" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#319795" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#319795" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#A0AEC0', fontSize: 12, fontWeight: 500 }}
                                                    dy={15}
                                                />
                                                <YAxis
                                                    hide
                                                    domain={[0, stats.totalPages || 'auto']}
                                                />
                                                <Tooltip
                                                    cursor={{ stroke: '#319795', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                    contentStyle={{
                                                        backgroundColor: '#1A202C',
                                                        borderRadius: '16px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                        padding: '12px 16px',
                                                        color: '#FFF'
                                                    }}
                                                    itemStyle={{ color: '#81E6D9', fontWeight: 'bold' }} // teal.200
                                                    labelStyle={{ color: '#A0AEC0', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="page"
                                                    stroke="#81E6D9"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorPage)"
                                                    activeDot={{ r: 6, strokeWidth: 4, stroke: '#1A202C' }} // Donut dot effect
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Flex h="100%" justify="center" align="center" direction="column" color={subTextColor} bg="whiteAlpha.100" borderRadius="xl">
                                            <Icon as={FaChartLine} w={12} h={12} mb={4} opacity={0.3} />
                                            <Text fontSize="lg" fontWeight="medium">{t('bookStats.chart.noData')}</Text>
                                            <Button mt={4} colorScheme="teal" variant="ghost" size="sm" onClick={() => navigate(`/books/${id}/session`)}>
                                                {t('bookStats.chart.readNow')}
                                            </Button>
                                        </Flex>
                                    )}
                                </Box>
                            </MotionCard>
                        </VStack>
                    </GridItem>
                </Grid>
            </Container>

            {/* Set Goal Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent bg="gray.800" color="white">
                    <ModalHeader>{t('bookStats.goal.modal.title', 'Set Reading Goal')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>{t('bookStats.goal.modal.period', 'Goal Period')}</FormLabel>
                                <RadioGroup value={goalType} onChange={setGoalType}>
                                    <Stack direction="row" spacing={4}>
                                        <Radio value="WEEKLY" colorScheme="teal">{t('bookStats.goal.modal.weekly', 'Weekly')}</Radio>
                                        <Radio value="MONTHLY" colorScheme="teal">{t('bookStats.goal.modal.monthly', 'Monthly')}</Radio>
                                    </Stack>
                                </RadioGroup>
                            </FormControl>
                            <FormControl>
                                <FormLabel>{t('bookStats.goal.modal.pages', 'Number of Pages')}</FormLabel>
                                <Input
                                    type="number"
                                    value={goalPages}
                                    onChange={(e) => setGoalPages(e.target.value)}
                                    placeholder="e.g. 50"
                                    focusBorderColor="teal.200"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} color="gray.400">{t('bookStats.goal.modal.cancel', 'Cancel')}</Button>
                        <Button colorScheme="teal" onClick={handleSaveGoal} isLoading={isSavingGoal}>
                            {t('bookStats.goal.modal.save', 'Save Goal')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

// Sub-component for KPI Cards
const StatsCard = ({ icon, label, value, subLabel, color, delay, bg, textColor }) => {
    return (
        <MotionCard
            bg={bg}
            borderRadius="2xl"
            boxShadow="lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            overflow="hidden"
            backdropFilter="blur(10px)"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl', bg: 'whiteAlpha.300' }}
        >
            <CardBody p={6}>
                <Flex align="center" mb={4}>
                    <Flex
                        justify="center"
                        align="center"
                        w={10}
                        h={10}
                        borderRadius="xl"
                        bg={`${color.split('.')[0]}.900`}
                        color={color}
                        mr={4}
                    >
                        <Icon as={icon} boxSize={5} />
                    </Flex>
                    <Text fontSize="sm" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide">
                        {label}
                    </Text>
                </Flex>
                <Stat>
                    <StatNumber fontSize="4xl" fontWeight="800" color={textColor}>
                        {value}
                    </StatNumber>
                    <StatHelpText m={0} fontSize="sm" color="gray.400" fontWeight="medium">
                        {subLabel}
                    </StatHelpText>
                </Stat>
            </CardBody>
        </MotionCard>
    );
};

export default BookStatsPage;

// Modal Component would be cleaner separated, but inline for now

