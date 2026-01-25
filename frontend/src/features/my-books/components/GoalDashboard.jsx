import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Text,
    Progress,
    VStack,
    HStack,
    Icon,
    Badge,
    Spinner
} from '@chakra-ui/react';
import { FaBullseye, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { booksApi } from '../../books/api';
import { useNavigate } from 'react-router-dom';

const GoalDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                // Fetch enough books to find goals. 
                // Ideal world: dedicated endpoint. Real world MVP: fetch 50.
                // Response is the JSON body directly (apiClient decodes it), so use response.content
                const response = await booksApi.getAll(0, 50);
                const allBooks = response.content || [];

                // Filter books with goals
                const booksWithGoals = allBooks.filter(b => b.readingGoalType && b.readingGoalPages > 0);

                // Sort: 
                // 1. Unfinished goals first
                // 2. Weekly before Monthly
                // 3. High % completion first (to encourage finishing)
                const sorted = booksWithGoals.sort((a, b) => {
                    const progA = (a.readingGoalProgress || 0) / a.readingGoalPages;
                    const progB = (b.readingGoalProgress || 0) / b.readingGoalPages;
                    const finishedA = progA >= 1;
                    const finishedB = progB >= 1;

                    if (finishedA !== finishedB) return finishedA ? 1 : -1; // Unfinished first
                    if (a.readingGoalType !== b.readingGoalType) return a.readingGoalType === 'WEEKLY' ? -1 : 1;
                    return progB - progA; // Higher progress first
                });

                setBooks(sorted);
            } catch (error) {
                console.error("Failed to fetch goals", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, []);

    // if (loading) return null; // Removed to prevent layout shift

    const activeGoalsCount = books.filter(b => (b.readingGoalProgress || 0) < b.readingGoalPages).length;

    return (
        <Box position="relative" zIndex="100">
            <Menu>
                <MenuButton
                    as={Button}
                    variant="ghost"
                    color="white"
                    size="lg"
                    py={8}
                    px={6}
                    _hover={{ bg: 'whiteAlpha.200' }}
                    _active={{ bg: 'whiteAlpha.300' }}
                >
                    <HStack spacing={2} align="center">
                        <Text fontSize="2xl" fontWeight="bold">{t('home.goals', 'My Goals')}</Text>
                        {activeGoalsCount > 0 && (
                            <Badge
                                colorScheme="teal"
                                borderRadius="full"
                                px={2}
                                fontSize="0.9em"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mt="-2px"
                            >
                                {activeGoalsCount}
                            </Badge>
                        )}
                    </HStack>
                </MenuButton>
                <MenuList bg="gray.800" borderColor="gray.700" p={2} boxShadow="xl" maxH="400px" overflowY="auto" width="320px">
                    <Text px={3} py={2} fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                        {t('home.yourTargets', 'Your Targets')}
                    </Text>

                    {books.length === 0 && (
                        <Box px={3} py={4} textAlign="center" color="gray.500" fontSize="sm">
                            {t('home.noGoals', 'No active goals')}
                        </Box>
                    )}

                    {books.map(book => {
                        const progress = book.readingGoalProgress || 0;
                        const target = book.readingGoalPages;
                        const percent = Math.min(100, Math.round((progress / target) * 100));
                        const isFinished = progress >= target;
                        const multiplier = isFinished ? Math.floor(progress / target) : 0;

                        return (
                            <MenuItem
                                key={book.id}
                                bg="transparent"
                                _hover={{ bg: 'whiteAlpha.100' }}
                                borderRadius="md"
                                mb={1}
                                onClick={() => navigate(`/books/${book.id}/stats`)}
                            >
                                <VStack align="start" w="full" spacing={1}>
                                    <HStack justify="space-between" w="full">
                                        <Text fontWeight="bold" fontSize="sm" color="white" noOfLines={1} maxW="180px">
                                            {book.title}
                                        </Text>
                                        <Badge size="sm" colorScheme={book.readingGoalType === 'WEEKLY' ? 'purple' : 'blue'} variant="subtle" fontSize="xx-small">
                                            {book.readingGoalType === 'WEEKLY' ? 'WEEKLY' : 'MONTHLY'}
                                        </Badge>
                                    </HStack>

                                    <HStack justify="space-between" w="full" fontSize="xs" color="gray.400">
                                        <Box>
                                            {isFinished ? (
                                                <HStack spacing={1} color="green.300">
                                                    <Icon as={FaCheckCircle} />
                                                    <Text>Done!</Text>
                                                    {multiplier >= 2 && <Text>({multiplier}x)</Text>}
                                                </HStack>
                                            ) : (
                                                <HStack spacing={1}>
                                                    <Text>{progress} / {target} p.</Text>
                                                </HStack>
                                            )}
                                        </Box>
                                        <Text fontWeight="bold" color={isFinished ? "green.300" : "teal.200"}>{percent}%</Text>
                                    </HStack>

                                    <Progress
                                        value={percent}
                                        size="xs"
                                        w="full"
                                        colorScheme={isFinished ? "green" : "teal"}
                                        borderRadius="full"
                                    />
                                </VStack>
                            </MenuItem>
                        );
                    })}
                </MenuList>
            </Menu>
        </Box>
    );
};

export default GoalDashboard;
