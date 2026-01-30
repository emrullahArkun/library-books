import {
    Box,
    Heading,
    Text,
    Flex,
    Card,
    VStack,
    Progress
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BookCover from '../../../ui/BookCover';

const MotionBox = motion(Box);

const SessionBookSidebar = ({ book, cardBg, textColor, subTextColor }) => {
    const { t } = useTranslation();


    return (
        <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card bg={cardBg} borderRadius="2xl" boxShadow="lg" p={6} backdropFilter="blur(10px)">
                <VStack spacing={6} align="center" w="full">
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

                    <Box textAlign="center" w="full">
                        <Heading size="md" mb={1} color={textColor} fontWeight="800" lineHeight="1.2">
                            {book.title}
                        </Heading>
                        <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                            {book.authorName}
                        </Text>
                    </Box>

                    <Box w="full" h="1px" bg="whiteAlpha.200" />

                    <Box w="full">
                        <Flex justify="space-between" mb={2} fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                            <Text>{t('bookStats.currentPage')}</Text>
                            <Text>{book.currentPage || 0}</Text>
                        </Flex>
                        <Progress
                            value={book.pageCount ? ((book.currentPage || 0) / book.pageCount) * 100 : 0}
                            size="sm"
                            colorScheme="teal"
                            borderRadius="full"
                            bg="whiteAlpha.100"
                        />
                    </Box>
                </VStack>
            </Card>
        </MotionBox>
    );
};

export default SessionBookSidebar;
