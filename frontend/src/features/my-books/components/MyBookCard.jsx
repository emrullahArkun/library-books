import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import { getHighResImage } from '../../../utils/googleBooks';
import {
    Box,
    Image,
    Text,
    Badge,
    Progress,
    Button,
    Checkbox,
    VStack,
    Center,
    useColorModeValue,
    Flex,
    Tooltip,
    HStack
} from '@chakra-ui/react';
import UpdateProgressModal from './UpdateProgressModal';


const MyBookCard = ({
    book,
    isSelected,
    onToggleSelect,
    onUpdateProgress,
    onUpdateStatus,
    activeSession,
    onStartSession,
    onStopSession,
    onExcludeTime,
    timerTime
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);


    const [frozenTimerDisplay, setFrozenTimerDisplay] = useState(null);
    const [stopTime, setStopTime] = useState(null);

    const cardBg = useColorModeValue('white', 'gray.700');
    const hoverTransform = 'translateY(-5px)';

    // Removed inline stop logic as it is now handled in ReadingSessionPage
    /*
        const handleStopClick = () => {
            setStopTime(new Date());
            setFrozenTimerDisplay(timerTime);
            setIsStopModalOpen(true);
        };
    
        const handleStopConfirm = (newPage) => {
            const pagesRead = newPage - (book.currentPage || 0);
            onUpdateProgress(book.id, newPage);
            onStopSession(stopTime, newPage);
            setIsStopModalOpen(false);
            setFrozenTimerDisplay(null);
            if (pagesRead > 0) {
                alert(t('readingSession.pagesReadAlert', { pages: pagesRead }));
            }
        };
    
        const handleStopCancel = () => {
            if (stopTime) {
                const now = new Date();
                const diff = now.getTime() - stopTime.getTime();
                if (diff > 1000 && typeof onExcludeTime === 'function') {
                    try {
                        onExcludeTime(diff);
                    } catch (error) {
                        console.error("Error calling onExcludeTime", error);
                    }
                }
            }
            setIsStopModalOpen(false);
            setFrozenTimerDisplay(null);
            setStopTime(null);
        };
    */

    const handleUpdate = (id, page) => {
        onUpdateProgress(id, page);
        setIsModalOpen(false);
    };

    const safeUrl = book.coverUrl ? getHighResImage(book.coverUrl) : '';

    const [imgSrc, setImgSrc] = useState(safeUrl);

    const handleImageError = () => {
        // Fallback logic
    };

    return (
        <Box
            position="relative"
            transition="transform 0.2s"
            _hover={{ transform: hoverTransform }}
            maxW="240px"
            w="100%"
            m="0 auto"
            className="book-card-detail"
        >
            <Box position="absolute" top="5px" right="5px" zIndex="20">
                <Checkbox
                    isChecked={isSelected}
                    onChange={() => onToggleSelect(book.id)}
                    size="lg"
                    colorScheme="blue"
                    bg="white"
                    rounded="md"
                    aria-label={t('myBooks.markAsRead') || 'Mark as Read'}
                />
            </Box>

            <Box
                h="320px"
                mb="10px"
                cursor="pointer"
                onClick={() => navigate(`/books/${book.id}/stats`)}
                position="relative"
            >
                {book.coverUrl ? (
                    <Image
                        src={imgSrc}
                        onError={handleImageError}
                        alt={book.title}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        borderRadius="md"
                        boxShadow="md"
                    />
                ) : (
                    <Center
                        w="100%"
                        h="100%"
                        borderRadius="md"
                        bg="gray.100"
                        color="gray.500"
                        boxShadow="md"
                    >
                        {t('bookCard.noCover')}
                    </Center>
                )}

                {book.completed && (
                    <Center
                        position="absolute"
                        top="0"
                        left="0"
                        w="100%"
                        h="100%"
                        bg="rgba(0, 0, 0, 0.4)"
                        borderRadius="md"
                        alignItems="flex-end"
                        pb="20px"
                    >
                        <Badge
                            bg="white"
                            color="black"
                            fontSize="0.9rem"
                            px="3"
                            py="1"
                            borderRadius="md"
                            boxShadow="base"
                        >
                            {t('bookCard.finished')}
                        </Badge>
                    </Center>
                )}
            </Box>

            <VStack align="stretch" spacing={2}>
                {book.pageCount > 0 ? (
                    <>
                        <Box>
                            <Progress
                                value={((book.currentPage || 0) / book.pageCount) * 100}
                                size="sm"
                                colorScheme="green"
                                borderRadius="full"
                            />
                            <Text fontSize="xs" textAlign="center" mt={1} fontWeight="semibold" color="gray.600">
                                {t('bookCard.readProgress', { current: book.currentPage || 0, total: book.pageCount })}
                            </Text>

                            <Button
                                w="100%"
                                size="sm"
                                variant="outline"
                                colorScheme="teal"
                                leftIcon={<FaPlay />}
                                onClick={() => navigate(`/books/${book.id}/session`)}
                            >
                                {t('readingSession.start')}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center">{t('bookCard.pagesUnknown')}</Text>
                )}
            </VStack>

            {isModalOpen && (
                <UpdateProgressModal
                    book={book}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={handleUpdate}
                />
            )}


        </Box>
    );
};

export default MyBookCard;
