import {
    Box,
    Heading,
    Text,
    Flex,
    Button,
    Card,
    VStack,
    Icon,
    Progress,
    Badge
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import BookCover from '../../../ui/BookCover';

const MotionBox = motion(Box);

const BookStatsSidebar = ({
    book,
    stats,
    goalProgress,
    onOpenModal,
    cardBg,
    textColor,
    subTextColor
}) => {
    const { t } = useTranslation();


    return (
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
                        <BookCover
                            book={book}
                            w="100%"
                            h="auto"
                            objectFit="cover"
                            borderRadius="xl"
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
                            <Button size="xs" colorScheme="teal" variant="ghost" onClick={onOpenModal}>
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
                    {stats && (
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
                    )}

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
    );
};

export default BookStatsSidebar;
