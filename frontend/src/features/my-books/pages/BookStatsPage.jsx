import React, { useEffect, useState } from 'react';
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
    useColorModeValue,
    Spinner,
    Stack,
    Icon
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useBookStats } from '../hooks/useBookStats';
import { FaBookOpen, FaChartLine, FaCheck, FaArrowLeft, FaClock } from 'react-icons/fa';

const BookStatsPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    // Custom Hook
    const { book, sessions, loading } = useBookStats(id);

    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    if (loading) return (
        <Flex justify="center" align="center" h="100vh">
            <Spinner size="xl" color="teal.500" />
        </Flex>
    );

    if (!book) return <Box textAlign="center" py={10}>Book not found</Box>;

    const totalSeconds = sessions.reduce((acc, session) => {
        if (!session.endTime || !session.startTime) return acc;
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        return acc + (end - start) / 1000;
    }, 0);

    const totalHours = (totalSeconds / 3600).toFixed(1);

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };
    const formattedTotalTime = formatDuration(totalSeconds);

    const pagesReadTotal = book.currentPage || 0;

    // Use high precision for calculation
    const totalHoursRaw = totalSeconds / 3600;
    const speedRaw = totalHoursRaw > 0 ? pagesReadTotal / totalHoursRaw : 0;
    const speed = speedRaw.toFixed(1);

    const pagesLeft = (book.pageCount || 0) - pagesReadTotal;

    let formattedHoursLeft = "0h 0m";
    if (speedRaw > 0) {
        const hoursLeftRaw = pagesLeft / speedRaw;
        const secondsLeft = hoursLeftRaw * 3600;
        const h = Math.floor(secondsLeft / 3600);
        const m = Math.floor((secondsLeft % 3600) / 60);
        formattedHoursLeft = `${h}h ${m}m`;
    }

    // Aggregate sessions by day (taking the latest endPage for that day)
    const sessionsByDay = sessions.reduce((acc, session) => {
        if (!session.endTime || session.endPage === null) return acc;

        const dateObj = new Date(session.endTime);
        const dateKey = dateObj.toLocaleDateString(); // Group by full date string (local)

        if (!acc[dateKey] || new Date(acc[dateKey].endTime) < dateObj) {
            acc[dateKey] = session;
        }
        return acc;
    }, {});

    const graphData = Object.values(sessionsByDay)
        .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
        .map(s => ({
            date: new Date(s.endTime).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }),
            page: s.endPage
        }));

    return (
        <Box bg={bgColor} minH="100vh" py={8}>
            <Container maxW="container.xl">
                <Button
                    leftIcon={<Icon as={FaArrowLeft} />}
                    mb={6}
                    variant="ghost"
                    onClick={() => navigate('/my-books')}
                >
                    {t('myBooks.title')}
                </Button>

                <Flex direction={{ base: "column", md: "row" }} gap={8} mb={10}>
                    <Box flexShrink={0}>
                        <Image
                            src={book.coverUrl}
                            alt={book.title}
                            borderRadius="lg"
                            boxShadow="xl"
                            maxW="200px"
                            objectFit="cover"
                        />
                    </Box>
                    <Box flex="1">
                        <Heading size="xl" mb={2}>{book.title}</Heading>
                        <Text fontSize="lg" color="gray.500" mb={4}>{book.authorName}</Text>

                        {book.completed && (
                            <Box display="inline-flex" alignItems="center" bg="teal.100" color="teal.800" px={3} py={1} borderRadius="full">
                                <Icon as={FaCheck} mr={2} />
                                <Text fontWeight="bold">{t('bookCard.finished')}</Text>
                            </Box>
                        )}
                    </Box>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
                    <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.500"><Icon as={FaClock} mr={2} />Gesamtzeit</StatLabel>
                                <StatNumber fontSize="3xl" color="teal.600">{formattedTotalTime}</StatNumber>
                                <StatHelpText>Investierte Zeit</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.500"><Icon as={FaBookOpen} mr={2} />Geschwindigkeit</StatLabel>
                                <StatNumber fontSize="3xl" color="blue.600">{speed}</StatNumber>
                                <StatHelpText>Seiten pro Stunde</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    {!book.completed && (
                        <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                            <CardBody>
                                <Stat>
                                    <StatLabel color="gray.500"><Icon as={FaChartLine} mr={2} />Prognose</StatLabel>
                                    <StatNumber fontSize="3xl" color="purple.600">~{formattedHoursLeft}</StatNumber>
                                    <StatHelpText>bis zum Ziel</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    )}
                </SimpleGrid>

                <Card bg={cardBg} borderRadius="xl" boxShadow="md" p={6}>
                    <Heading size="md" mb={6}>Lese-Verlauf</Heading>
                    <Box h="400px">
                        {graphData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={graphData}>
                                    <defs>
                                        <linearGradient id="colorPage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#319795" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#319795" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, book.pageCount || 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="page" stroke="#319795" fillOpacity={1} fill="url(#colorPage)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <Flex h="100%" justify="center" align="center" color="gray.400" direction="column">
                                <Icon as={FaChartLine} w={10} h={10} mb={4} />
                                <Text>Absolviere deine erste Lese-Sitzung, um Daten zu sehen.</Text>
                            </Flex>
                        )}
                    </Box>
                </Card>
            </Container>
        </Box>
    );
};

export default BookStatsPage;
