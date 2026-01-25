import { useState, useMemo } from 'react';
import {
    Box,
    Grid,
    Text,
    IconButton,
    Flex,
    Badge,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    Tooltip
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ReadingCalendar = ({ sessions }) => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Theme calculations
    const textColor = 'white';
    const subTextColor = 'gray.400';
    // const activeDayColor = 'white';

    // 1. Process Sessions to get "Pages Read per Day" map
    // Logic: Sum of (endPage - startPage) for sessions ending on that day.

    const dailyPages = useMemo(() => {
        // Filter out bad data
        const validSessions = sessions.filter(s => s.endTime && s.endPage !== null);
        const sortedSessions = [...validSessions].sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
        const map = {};

        sortedSessions.forEach((session, index) => {
            const dayKey = new Date(session.endTime).toDateString();
            let pagesInSession = 0;

            // Best effort calculation
            if (index > 0) {
                const prev = sortedSessions[index - 1];
                if (session.endPage >= prev.endPage) {
                    pagesInSession = session.endPage - prev.endPage;
                } else {
                    pagesInSession = 0;
                }
            } else {
                pagesInSession = session.endPage;
            }

            if (!map[dayKey]) map[dayKey] = 0;
            map[dayKey] += pagesInSession;
        });

        return map;
    }, [sessions]);

    // Calendar Helpers
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<Box key={`empty-${i}`} />);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateKey = date.toDateString();
            const pages = dailyPages[dateKey];
            const hasActivity = pages > 0;

            days.push(
                hasActivity ? (
                    <Tooltip key={day} label={`${pages} ${t('bookStats.pages', 'Seiten')}`} hasArrow bg="teal.600" color="white">
                        <Box
                            textAlign="center"
                            p={2}
                            bg='whiteAlpha.100'
                            borderRadius="md"
                            position="relative"
                            cursor='pointer'
                            _hover={{ bg: 'whiteAlpha.200' }}
                            border='1px solid'
                            borderColor="teal.500"
                        >
                            <Text color={textColor} fontSize="sm" fontWeight='bold'>
                                {day}
                            </Text>
                            <Badge
                                colorScheme="teal"
                                variant="solid"
                                fontSize="0.6rem"
                                borderRadius="full"
                                px={1}
                                position="absolute"
                                bottom="-5px" left="50%" transform="translateX(-50%)"
                                boxShadow="0 0 5px teal"
                            >
                                +{pages}
                            </Badge>
                        </Box>
                    </Tooltip>
                ) : (
                    <Box
                        key={day}
                        textAlign="center"
                        p={2}
                        bg='transparent'
                        borderRadius="md"
                        position="relative"
                        cursor='default'
                    >
                        <Text color={textColor} fontSize="sm" fontWeight='normal'>
                            {day}
                        </Text>
                    </Box>
                )
            );
        }

        return days;
    };

    return (
        <Popover placement="bottom-end" isLazy>
            <PopoverTrigger>
                <IconButton
                    icon={<FaCalendarAlt />}
                    variant="ghost"
                    color="teal.200"
                    _hover={{ bg: 'whiteAlpha.200', transform: 'scale(1.1)' }}
                    aria-label="Calendar"
                    size="lg"
                />
            </PopoverTrigger>
            <PopoverContent bg="gray.900" borderColor="whiteAlpha.300" boxShadow="xl" w="320px">
                <PopoverArrow bg="gray.900" />
                <PopoverCloseButton color="white" mt={2} mr={2} />
                <PopoverHeader borderColor="whiteAlpha.100" pt={12} pb={4} borderBottomWidth="1px">
                    <Flex justify="space-between" align="center">
                        <IconButton
                            icon={<FaChevronLeft />}
                            size="sm"
                            variant="ghost"
                            color="white"
                            onClick={prevMonth}
                            _hover={{ bg: 'whiteAlpha.200', color: 'teal.200' }}
                        />
                        <Text color="white" fontWeight="bold">
                            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </Text>
                        <IconButton
                            icon={<FaChevronRight />}
                            size="sm"
                            variant="ghost"
                            color="white"
                            onClick={nextMonth}
                            _hover={{ bg: 'whiteAlpha.200', color: 'teal.200' }}
                        />
                    </Flex>
                </PopoverHeader>
                <PopoverBody p={4}>
                    {/* Weekday Headers */}
                    <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={2}>
                        {DAYS.map(day => (
                            <Text key={day} color={subTextColor} fontSize="xs" textAlign="center">
                                {day}
                            </Text>
                        ))}
                    </Grid>
                    {/* Days Grid */}
                    <Grid templateColumns="repeat(7, 1fr)" gap={2} rowGap={4}>
                        {renderCalendarDays()}
                    </Grid>

                    <Box mt={6} textAlign="center">
                        <Text fontSize="xs" color="gray.500">
                            {t('bookStats.calendarHint', 'Tippe auf ein Datum für Details')}
                        </Text>
                    </Box>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default ReadingCalendar;
