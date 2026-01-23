import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    Stat,
    StatLabel,
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
    HStack,
    Badge,
    Grid,
    GridItem
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { useBookStats } from '../hooks/useBookStats';
import { FaBookOpen, FaChartLine, FaCheck, FaArrowLeft, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getHighResImage } from '../../../utils/googleBooks';

// Motion components
const MotionCard = motion(Card);
const MotionBox = motion(Box);

const BookStatsPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    // Custom Hook
    const { book, sessions, loading } = useBookStats(id);

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
                                    <Badge variant="subtle" colorScheme="gray" px={3} py={1} borderRadius="md" fontSize="xs" bg="whiteAlpha.200" color="white">
                                        <Icon as={FaCalendarAlt} mr={2} />
                                        {t('bookStats.chart.badge')}
                                    </Badge>
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
